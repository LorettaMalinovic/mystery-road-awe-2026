import type { Evidence } from "../../../js/types";

interface BookmarksListProps {
  items: Evidence[];
  onRemove: (id: string) => void;
}

export const BookmarksList = ({ items, onRemove }: BookmarksListProps) => {
  if (items.length === 0) {
    return <p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>;
  }

  return (
    <>
      {items.map((ev) => (
        <div className="mini-list-item" key={ev.id}>
          <strong>{ev.id}</strong> &mdash; {ev.title}{" "}
          <button
            type="button"
            className="btn btn-small btn-secondary"
            onClick={() => onRemove(ev.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </>
  );
};
