import React from 'react'

type Props = {}

const EarlyAccess = (props: Props) => {
    return (
        <div className="fixed top-[95px] left-0 w-full bg-[#FFD700] text-[#664E33] p-4 text-center z-10">
            <div className="max-w-6xl mx-auto flex items-center justify-between flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <span className="font-medium w-[200px] text-[#664E33]">
                        Early Access Notice
                    </span>
                </div>
                <p className="text-sm text-[#664E33]">
                    <strong>
                        OpenBook.Games is still in early-access. This means you may,
                        at times, encounter bugs that may disrupt game creation.
                    </strong>{" "}
                    <br />
                    <strong>
                        To minimize any risk from glitches, we recommend writing and
                        saving your game prompts locally (word, txt doc, etc.) on your
                        system before uploading them to OpenBook.Games to create a
                        game.
                    </strong>
                </p>
            </div>
        </div>
    )
}

export default EarlyAccess