import { UserStatus } from "@/interface";
import { FunctionComponent } from "react";

type FooterProps = {
  text: UserStatus;
};

export const Footer: FunctionComponent<FooterProps> = ({ text }) => {
  return (
    <footer className="shadow bg-[#009a0863] border-t-2 border-black ">
      <div className="w-full mx-auto max-w-screen-xl p-4 flex items-center justify-center">
        <div className="text-sm text-black sm:text-lg sm:text-center font-semi">
          {text}
        </div>
      </div>
    </footer>
  );
};
