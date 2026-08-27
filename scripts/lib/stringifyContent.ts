import { Document, isMap, isScalar, isSeq, YAMLMap } from "yaml";
import type { ContentFile } from "../../src/data/content.ts";

export function stringifyContent(content: ContentFile): string {
  const doc = new Document(content);
  const root = doc.contents;
  if (!isMap(root)) throw new Error("Expected content document root to be a map");

  for (const sectionPair of root.items) {
    const section = sectionPair.value;
    if (!isMap(section)) continue;

    const itemsSeq = section.get("items", true);
    if (!isSeq(itemsSeq)) continue;

    for (const item of itemsSeq.items) {
      if (!isMap(item)) continue;
      for (const fieldPair of (item as YAMLMap).items) {
        if (isScalar(fieldPair.key) && fieldPair.key.value === "themes" && isSeq(fieldPair.value)) {
          fieldPair.value.flow = true;
        }
      }
    }
  }

  return doc.toString({ lineWidth: 0, flowCollectionPadding: false });
}
