/** Projects shown on the site. Texts live in messages/*.json under Site.projects.<key>. */
export const projects = [
  { slug: "good-people", key: "goodPeople", href: "https://good-people.pro", host: "good-people.pro", tint: "gold" },
  { slug: "dual-ascent", key: "dualAscent", href: "https://t.me/demodualascent_bot", host: "t.me/demodualascent_bot", tint: "sand" },
] as const;

export type ProjectSlug = (typeof projects)[number]["slug"];

export function findProject(slug: string) {
  return projects.find(project => project.slug === slug);
}
