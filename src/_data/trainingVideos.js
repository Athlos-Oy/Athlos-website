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
  },
];

// ZIP packages + documents (uploaded to the same media store).
const PACKAGES = {
  zipCaptioned: { file: "zip/DC-Air_Clinical_Training_EN-Captions_2026-07.zip", size: "" },
  zipNoCaptions: { file: "zip/DC-Air_Clinical_Training_No-Captions_2026-07.zip", size: "" },
  guidePdf: { file: "docs/DC-Air_User_QA_Troubleshooting_Guide_2026-1.pdf", size: "" },
  ifuPdf: { file: "docs/DC-Air_Instructions_for_Use_Rev18.pdf", size: "" },
};

function mediaUrl(path) {
  return base ? `${base}/${path}${query}` : "";
}

export default {
  categories: CATEGORIES,
  videos: VIDEOS.map((v) => ({
    ...v,
    watchUrl: mediaUrl(`video/captioned/${v.stem}_EN-Captions.mp4`),
    downloadCaptionedUrl: mediaUrl(`video/captioned/${v.stem}_EN-Captions.mp4`),
    downloadNoCaptionsUrl: mediaUrl(`video/no-captions/${v.stem}_No-Captions.mp4`),
    poster: `/dc-air-training/assets/posters/${v.stem}_Poster.webp`,
  })),
  zipCaptionedUrl: mediaUrl(PACKAGES.zipCaptioned.file),
  zipNoCaptionsUrl: mediaUrl(PACKAGES.zipNoCaptions.file),
  guidePdfUrl: mediaUrl(PACKAGES.guidePdf.file),
  ifuPdfUrl: mediaUrl(PACKAGES.ifuPdf.file),
  sizes: PACKAGES,
  totalCount: VIDEOS.length,
  totalDuration: "18 min",
};
