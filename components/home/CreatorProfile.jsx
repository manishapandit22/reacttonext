import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HiSparkles } from "react-icons/hi";
import Button from "../ui/Button";

const CreatorProfile = ({
  user,
  showButton = false,
  profileImage = "/img/Lauren.png",
  name = "Lauren Gouin",
  description = 'Narrative Designer, \n"Author of Anathema"',
  quote = "Having your work published or produced by the entertainment industry can feel inaccessible if you don't have the right connections.\nOpenBook is acting like a bridge over those barriers, it honours storytelling and initiates a friendship between writers and the technical aptitude of AI.",
  className = "",
}) => {
  return (
    <div className={`w-full lg:w-1/2 relative z-10 ${className}`}>
      <div className="flex items-center gap-4 md:gap-6 mb-6">
        <div className="relative w-16 md:w-20 h-16 md:h-20 overflow-hidden rounded-full ring-2 ring-accent ring-offset-4 ring-offset-jacarta-900 flex-shrink-0 shadow-xl shadow-accent/10">
          <Image
            src={profileImage}
            alt={`${name} Profile`}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-display text-lg md:text-xl text-white">{name}</h3>
          <p className="text-jacarta-400 text-sm md:text-base">{description}</p>
        </div>
      </div>

      <blockquote className="text-jacarta-300 text-base md:text-lg italic mb-6 md:mb-8 relative pl-4 md:pl-6 border-l-2 border-accent">
        <p dangerouslySetInnerHTML={{ __html: `&quot;${quote}&quot;` }} />
      </blockquote>
      {showButton && (
        <Link
          href={user ? "/create" : "#"}
          data-bs-toggle={!user ? "modal" : undefined}
          data-bs-target={!user ? "#loginModalForCreating" : undefined}
          className="inline-block"
        >
          <Button className="group flex items-center gap-2 md:gap-3 bg-gradient-to-r from-accent to-purple-600 hover:from-accent-dark hover:to-purple-700 transform transition-all duration-300 hover:-translate-y-1 text-sm md:text-base py-2 md:py-3 px-5 md:px-6 shadow-lg shadow-accent/20">
            <HiSparkles className="text-xl md:text-2xl transition-transform group-hover:rotate-12" />
            <span>Start Creating</span>
          </Button>
        </Link>
      )}
    </div>
  );
};

export default CreatorProfile;
