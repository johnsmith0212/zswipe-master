import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { FunctionComponent } from "react";

export type StepperProps = {
  step: number;
  onPrevClick?: () => void;
  onNextClick?: () => void;
};

export const Stepper: FunctionComponent<StepperProps> = ({
  step,
  onPrevClick,
  onNextClick,
}) => {
  return (
    <div className="flex w-full justify-between pt-6">
      {onPrevClick !== undefined ? (
        <button
          className="flex items-center font-semibold"
          disabled={!onPrevClick}
          onClick={onPrevClick || undefined}
        >
          <ChevronLeftIcon height={15} /> Prev
        </button>
      ) : (
        <div className="flex w-12" />
      )}

      <div className="flex text-center items-center font-bold">
        {step.toString()}/2
      </div>

      {onNextClick !== undefined ? (
        <button
          className="flex items-center font-semibold"
          disabled={!onNextClick}
          onClick={onNextClick || undefined}
        >
          Next <ChevronRightIcon height={15} />
        </button>
      ) : (
        <div className="flex w-12" />
      )}
    </div>
  );
};
