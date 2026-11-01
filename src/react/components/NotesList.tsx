export interface NoteEntry {
  evidenceId: string;
  title: string;
  text: string;
}

interface NotesListProps {
  entries: NoteEntry[];
}

export const NotesList = ({ entries }: NotesListProps) => {
  if (entries.length === 0) {
    return <p>No notes yet. Add one from an evidence item's detail view.</p>;
  }

  return (
    <>
      {entries.map((entry) => (
        <div className="mini-list-item" key={entry.evidenceId}>
          <strong>{entry.evidenceId}</strong> &mdash; {entry.title}
          <div>{entry.text}</div>
        </div>
      ))}
    </>
  );
};
