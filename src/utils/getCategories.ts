import type { CollectionEntry } from "astro:content";
import { BLOG_PATH } from "@/content.config";

export const UNCATEGORIZED_SLUG = "uncategorized";

export type CategoryInfo = {
  /** Folder name under src/content/posts, e.g. "malware-analysis" */
  slug: string;
  /** Human-readable label, e.g. "Malware Analysis" */
  title: string;
  count: number;
};

/**
 * Extracts the category from a post's file path.
 * The first folder level under src/content/posts is the category folder:
 *   src/content/posts/<category>/<post-folder>/<post>.md
 */
export function getPostCategorySlug(
  filePath: string | undefined
): string | undefined {
  const segments =
    filePath
      ?.replace(BLOG_PATH, "")
      .split("/")
      .filter(path => path !== "")
      .filter(path => !path.startsWith("_"))
      .slice(0, -1) ?? []; // drop the file name

  return segments.length > 0 ? segments[0] : undefined;
}

/** Converts a category folder slug to a display title: "malware-analysis" -> "Malware Analysis" */
export function categorySlugToTitle(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Unique categories with post counts, sorted by count (desc) then title. */
export function getUniqueCategories(
  posts: CollectionEntry<"posts">[]
): CategoryInfo[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const slug = getPostCategorySlug(post.filePath) ?? UNCATEGORIZED_SLUG;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, title: categorySlugToTitle(slug), count }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
}
