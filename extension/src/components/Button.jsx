
export const Button = ({ func, text, icon, className="" }) => {
    return (
        <button className={`threeD-button text-xs border border-gray-600 cursor-pointer px-4 py-2 flex flex-col gap-2 items-center justify-center hover:bg-zinc-600 ${className}`} onClick={func}>
            {icon} {text}
        </button>
    )
}

