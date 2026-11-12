/** Shared between ZipperIntro (sets it) and SiteTour (waits for it): has the zip intro been opened this session? */
export const ZIPPER_SESSION_KEY = "zipper-opened";

export const zipperDone = () => {
  try {
    return sessionStorage.getItem(ZIPPER_SESSION_KEY) === "1";
  } catch {
    return false;
  }
};
