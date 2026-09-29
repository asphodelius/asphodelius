/** Projects shown on the site. Texts live in messages/*.json under Site.projects.<key>. */
export const projects = [
  { slug: "good-people", key: "goodPeople", href: "https://good-people.pro", host: "good-people.pro", highlight: true },
  { slug: "dual-ascent", key: "dualAscent", href: "https://t.me/demodualascent_bot", host: "t.me/demodualascent_bot", highlight: false },
] as const;

export type ProjectSlug = (typeof projects)[number]["slug"];

export function findProject(slug: string) {
  return projects.find(project => project.slug === slug);
}
