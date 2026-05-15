// Vercel serverless function — looks up a UFS QA sheet in Azure Blob Storage
// by invoice number and returns a time-limited SAS download URL.
//
// Required env vars: AZURE_SAS_TOKEN  (the read-only, container-scoped SAS,
//                                      WITHOUT a leading "?")
//                    CEFLA_PASSWORD   (shared password gate for the form)
// Optional env vars: AZURE_ACCOUNT    (default: "athlosshare")
//                    AZURE_CONTAINER  (default: "ufsqa")

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const expectedPassword = process.env.CEFLA_PASSWORD;
  if (!expectedPassword) {
    return res.status(500).json({
      ok: false,
      error: 'Server is not configured. Please contact info@athlos.fi.',
    });
  }

  const providedPassword = String(
    (req.method === 'POST' ? req.body?.password : req.query?.password) ?? ''
  );
  if (providedPassword !== expectedPassword) {
    return res
      .status(401)
      .json({ ok: false, error: 'Incorrect password.' });
  }

  // Password-only validation step: lets the client unlock the invoice form
  // before doing any blob lookup.
  const validateOnly =
    (req.method === 'POST' ? req.body?.validateOnly : req.query?.validateOnly) === true ||
    (req.method === 'POST' ? req.body?.validateOnly : req.query?.validateOnly) === 'true';
  if (validateOnly) {
    return res.status(200).json({ ok: true });
  }

  const raw =
    (req.method === 'POST' ? req.body?.invoice : req.query?.invoice) ?? '';
  const invoice = String(raw).trim();

  // Only allow safe filename characters — letters, digits, dot, dash, underscore.
  // This blocks path traversal and odd characters reaching Azure.
  if (!invoice || !/^[A-Za-z0-9._-]+$/.test(invoice)) {
    return res
      .status(400)
      .json({ ok: false, error: 'Please enter a valid invoice number.' });
  }

  const filename = invoice.toLowerCase().endsWith('.zip')
    ? invoice
    : `${invoice}.zip`;

  const account = process.env.AZURE_ACCOUNT || 'athlosshare';
  const container = process.env.AZURE_CONTAINER || 'ufsqa';
  const sas = process.env.AZURE_SAS_TOKEN;

  if (!sas) {
    return res.status(500).json({
      ok: false,
      error: 'Server is not configured. Please contact info@athlos.fi.',
    });
  }

  const sasClean = sas.replace(/^\?/, '');
  const url = `https://${account}.blob.core.windows.net/${container}/${encodeURIComponent(filename)}?${sasClean}`;

  try {
    const head = await fetch(url, { method: 'HEAD' });
    if (head.status === 200) {
      const lenHeader = head.headers.get('content-length');
      const size = lenHeader ? Number(lenHeader) : null;
      return res.status(200).json({ ok: true, url, filename, size });
    }
    if (head.status === 404) {
      return res
        .status(404)
        .json({ ok: false, error: 'QA sheet not found for that invoice number.' });
    }
    return res
      .status(502)
      .json({ ok: false, error: `Storage returned ${head.status}.` });
  } catch (err) {
    return res
      .status(502)
      .json({ ok: false, error: 'Could not reach storage. Please try again.' });
  }
}
