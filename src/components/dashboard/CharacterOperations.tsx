interface CharacterOperationsProps {
  onAddCharacter: () => void;
}

export default function CharacterOperations({ onAddCharacter }: CharacterOperationsProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold dark:text-white">
          Community Characters
        </h2>
        <button
          onClick={onAddCharacter}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Character
        </button>
      </div>
    </div>
  );
}