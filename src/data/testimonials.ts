export interface Testimonial {
  quote: string;
  name: string;
  /** e.g. "Product Lead, Qorelly" */
  role: string;
  /** Optional headshot in /public/testimonials. */
  photo?: string;
  /** Optional link to the person's LinkedIn or site, so visitors can verify the quote. */
  link?: string;
}

/**
 * Real quotes only, used with the person's permission. The Testimonials section on the home page
 * stays hidden while this list is empty.
 */
export const testimonials: Testimonial[] = [];
