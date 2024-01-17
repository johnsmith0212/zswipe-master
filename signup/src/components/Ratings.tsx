import { Dispatch, SetStateAction, FunctionComponent } from "react";

type RatingProps = {
  setRating: Dispatch<SetStateAction<string | undefined>>;
};

export const Ratings: FunctionComponent<RatingProps> = ({ setRating }) => {
  return (
    <div className="flex flex-wrap">
      <div className="flex items-center mr-4">
        <input
          id="1"
          type="radio"
          value="Male"
          name="colored-radio"
          className="w-4 h-4  bg-gray-100 border-blue-300 focus:ring-blue-500 focus:ring-2"
          onClick={(e) => setRating((e.target as HTMLInputElement).value)}
        />
        <label
          htmlFor="red-radio"
          className="ml-2 text-sm font-medium text-gray-900 "
        >
          Male
        </label>
      </div>
      <div className="flex items-center mr-4">
        <input
          id="2"
          type="radio"
          value="Female"
          name="colored-radio"
          className="w-4 h-4  bg-gray-100 border-blue-300 focus:ring-blue-500 focus:ring-2"
          onClick={(e) => setRating((e.target as HTMLInputElement).value)}
        />
        <label
          htmlFor="red-radio"
          className="ml-2 text-sm font-medium text-gray-900 "
        >
          Female
        </label>
      </div>
      <div className="flex items-center mr-4">
        <input
          id="3"
          type="radio"
          value="Transgender"
          name="colored-radio"
          className="w-4 h-4  bg-gray-100 border-blue-300 focus:ring-blue-500 focus:ring-2"
          onClick={(e) => setRating((e.target as HTMLInputElement).value)}
        />
        <label
          htmlFor="red-radio"
          className="ml-2 text-sm font-medium text-gray-900 "
        >
          Non-binary
        </label>
      </div>
    </div>
  );
};
