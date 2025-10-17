/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import { FaGoogle, FaDiscord } from "react-icons/fa";
import { signIn } from "next-auth/react";
import Button from "../ui/Button";


export default function LoginModalForCreating() {
  const handleGoogleSignIn = () => {
    signIn("google");
  };

  const handleDiscordSignIn = () => {
    signIn("discord");
  };


  return (
    <div
      className="modal fade"
      id="loginModalForCreating"
      tabIndex="-1"
      aria-labelledby="loginModalForCreatingLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog max-w-2xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="loginModalForCreatingLabel">
              {/* Login */}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="h-6 w-6 fill-jacarta-700 dark:fill-white"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="modal-body p-6">
            <div className="mb-2 flex items-center justify-center">
              <span className="font-display text-md font-semibold text-jacarta-700 dark:text-white tracking-widest text-center">
                We need to register the game to your account😊
                <br /> log in to get started
              </span>
            </div>
          </div>
          {/* end body */}

          <div className="modal-footer">
            <div className="flex flex-col items-center justify-center gap-4">
              <Button
                onClick={handleGoogleSignIn}
                className={`bg-jacarta-900 border-2 border-accent-lighter text-accent-lighter capitalize w-full`}
              >
                <FaGoogle className="text-xl" />
                Login with google
              </Button>
              <Button
                onClick={handleDiscordSignIn}
                className={`bg-[#5865F2] border-2 border-[#5865F2] text-white capitalize w-full hover:bg-[#4752C4] hover:border-[#4752C4]`}
              >
                <FaDiscord className="text-xl mr-2" />
                Login with Discord
              </Button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
