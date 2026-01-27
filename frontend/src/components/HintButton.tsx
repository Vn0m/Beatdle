import { Button } from "@/components/ui/button";

interface HintButtonProps {
  label: string;
  revealedInfo?: string;
  isRevealed: boolean;
  onReveal: () => void;
  disabled?: boolean;
}

export default function HintButton({
  label,
  revealedInfo,
  isRevealed,
  onReveal,
  disabled = false,
}: HintButtonProps) {
  return (
    <Button
      onClick={onReveal}
      disabled={isRevealed || disabled}
      className={`flex-1 font-sans font-medium text-sm transition-all duration-200 cursor-pointer ${
        isRevealed
          ? "bg-gray-100 border-2 border-gray-300 text-dark hover:bg-gray-100 cursor-default"
          : "bg-white border-2 border-primary-500 text-primary-500 hover:bg-primary-50 hover:border-primary-600"
      }`}
    >
      {isRevealed ? (
        <span className="truncate">{revealedInfo}</span>
      ) : (
        <span>{label}</span>
      )}
    </Button>
  );
}
