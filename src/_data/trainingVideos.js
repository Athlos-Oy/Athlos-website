// DC-Air® Training Center — video library metadata.
// Single source of truth for the Clinical Positioning Library on
// /dc-air-training. To add, replace, or reorder a video, edit this file
// (and upload the matching media files to the blob store) — nothing else.
//
// Asset URL model:
//   TRAINING_MEDIA_BASE  (env, build-time) — origin + path prefix of the
//                        media store, no trailing slash.
//   TRAINING_MEDIA_QUERY (env, optional)   — query string appended to
//                        every media URL (e.g. an Azure SAS token).
//                        Empty for Vercel Blob.
// Final URL: `${base}/${folder}/${file}${query}`. Poster images are
// small and ship with the site under /dc-air-training/assets/posters/
// (protected by the same edge middleware as the page).

const base = process.env.TRAINING_MEDIA_BASE || "";
const query = process.env.TRAINING_MEDIA_QUERY || "";

const CATEGORIES = [
  { key: "anterior", label: "Anterior" },
  { key: "posterior", label: "Posterior" },
  { key: "bitewing", label: "Bitewing" },
  { key: "special", label: "Special Holders" },
];

// duration = mm:ss of the encoded MP4 (verified from the final files).
// positioningOnly = true renders the "Positioning demonstration only" badge.
const VIDEOS = [
  {
    num: "01", slug: "lower-anterior", stem: "DC-Air_Training_01_Lower_Anterior",
    title: "Lower Anterior Positioning",
    description: "Mounting the sensor in the anterior holder and positioning for lower anterior exposures.",
    category: "anterior", duration: "1:13",
  },
  {
    num: "02", slug: "lower-anterior-premolar", stem: "DC-Air_Training_02_Lower_Anterior_Premolar",
    title: "Lower Anterior & Premolar Positioning",
    description: "Using the anterior holder for lower anterior and premolar regions.",
    category: "anterior", duration: "1:04",
  },
  {
    num: "03", slug: "upper-anterior", stem: "DC-Air_Training_03_Upper_Anterior",
    title: "Upper Anterior Positioning",
    description: "Step-by-step positioning for upper anterior exposures with the anterior holder.",
    category: "anterior", duration: "2:05",
  },
  {
    num: "04", slug: "upper-posterior-standard", stem: "DC-Air_Training_04_Upper_Posterior_Standard",
    title: "Standard Upper Posterior Positioning",
    description: "Regular use of the posterior holder for upper posterior exposures.",
    category: "posterior", duration: "1:42",
  },
  {
    num: "05", slug: "upper-wisdom-tooth", stem: "DC-Air_Training_05_Upper_Wisdom_Tooth",
    title: "Upper Wisdom Tooth Positioning",
    description: "Adapting the posterior holder to reach the upper wisdom tooth region.",
    category: "posterior", duration: "1:44",
  },
  {
    num: "06", slug: "lower-posterior-cotton-roll", stem: "DC-Air_Training_06_Lower_Posterior_Cotton_Roll",
    title: "Lower Posterior Positioning with Cotton Roll",
    description: "Using a cotton roll with the lower posterior holder for stable placement.",
    category: "posterior", duration: "1:52",
  },
  {
    num: "07", slug: "lower-posterior-comfort", stem: "DC-Air_Training_07_Lower_Posterior_Comfort",
    title: "Lower Posterior Comfort Technique",
    description: "A cotton-roll variation that improves patient comfort in the lower posterior region.",
    category: "posterior", duration: "1:42",
  },
  {
    num: "08", slug: "bitewing-distal", stem: "DC-Air_Training_08_Bitewing_Distal",
    title: "Bitewing Holder Using Distal Positioning",
    description: "Taking bitewings with the bitewing holder using the distal positioning technique.",
    category: "bitewing", duration: "3:39",
  },
  {
    num: "09", slug: "bitewing-children", stem: "DC-Air_Training_09_Bitewing_Children",
    title: "Bitewings for Children & Smaller Adults",
    description: "Using the endodontic holder to take bitewings on children and smaller adults.",
    category: "bitewing", duration: "1:09",
  },
  {
    num: "10", slug: "endodontic-holder", stem: "DC-Air_Training_10_Endodontic_Holder",
    title: "Endodontic Holder Positioning",
    description: "How to mount and position the endodontic holder.",
    category: "special", duration: "0:54", positioningOnly: true,
  },
  {
    num: "11", slug: "occlusal-holder", stem: "DC-Air_Training_11_Occlusal_Holder",
    title: "Occlusal Holder Positioning",
    description: "How to mount and position the occlusal holder.",
    category: "special", duration: "0:54", positioningOnly: true,
    // The supplied source file duplicates video 10's footage (verified
    // frame-by-frame 2026-07-20). Hidden from the page and excluded from
    // the ZIPs until FTG delivers the real occlusal export — then delete
    // this flag, upload the files, rebuild the ZIPs.
    status: "pending-replacement",
  },
];

// Only videos without a pending status are published.
const ACTIVE = VIDEOS.filter((v) => !v.status);

// "17 min" style total from the individual mm:ss durations.
function totalMinutes(list) {
  const secs = list.reduce((sum, v) => {
    const [m, s] = v.duration.split(":").map(Number);
    return sum + m * 60 + s;
  }, 0);
  return `${Math.round(secs / 60)} min`;
}

// ZIP packages + documents (uploaded to the same media store).
// Media store: Vercel Blob. "View" links use the plain blob URL (inline
// rendering, PDF #page= anchors work); "Download" links append
// ?download=1, which Vercel Blob translates to Content-Disposition:
// attachment. Works identically if we ever switch back to Azure with a
// SAS in TRAINING_MEDIA_QUERY (Azure ignores the extra parameter).
const PACKAGES = {
  zipCaptioned: { file: "zip/DC-Air_Clinical_Training_EN-Captions_2026-07.zip", size: "349 MB" },
  zipNoCaptions: { file: "zip/DC-Air_Clinical_Training_No-Captions_2026-07.zip", size: "348 MB" },
  guidePdf: { file: "docs/DC-Air_User_QA_Troubleshooting_Guide_2026-1.pdf", size: "4.2 MB" },
  ifuPdf: { file: "docs/DC-Air_Instructions_for_Use_Rev18.pdf", size: "1.1 MB" },
};

function mediaUrl(path) {
  return base ? `${base}/${path}${query}` : "";
}

// Download variant — forces a save dialog instead of inline playback/view.
function downloadUrl(path) {
  const u = mediaUrl(path);
  return u ? `${u}${u.includes("?") ? "&" : "?"}download=1` : "";
}

// Document metadata rendered on the cards — single source of truth so a
// revision bump is a one-line change here (ISO 13485: revision must be
// visible to the user).
const DOCUMENTS = {
  guide: { pages: 13, version: "Version 2026.1" },
  ifu: { pages: 40, revision: "0000679 Rev. 18" },
};

export default {
  categories: CATEGORIES,
  documents: DOCUMENTS,
  videos: ACTIVE.map((v) => ({
    ...v,
    watchUrl: mediaUrl(`video/captioned/${v.stem}_EN-Captions.mp4`),
    downloadCaptionedUrl: downloadUrl(`video/captioned/${v.stem}_EN-Captions.mp4`),
    downloadNoCaptionsUrl: downloadUrl(`video/no-captions/${v.stem}_No-Captions.mp4`),
    poster: `/dc-air-training/assets/posters/${v.stem}_Poster.webp`,
  })),
  zipCaptionedUrl: downloadUrl(PACKAGES.zipCaptioned.file),
  zipNoCaptionsUrl: downloadUrl(PACKAGES.zipNoCaptions.file),
  guidePdfUrl: mediaUrl(PACKAGES.guidePdf.file),
  ifuPdfUrl: mediaUrl(PACKAGES.ifuPdf.file),
  guidePdfDownloadUrl: downloadUrl(PACKAGES.guidePdf.file),
  ifuPdfDownloadUrl: downloadUrl(PACKAGES.ifuPdf.file),
  sizes: PACKAGES,
  totalCount: ACTIVE.length,
  totalDuration: totalMinutes(ACTIVE),
};
