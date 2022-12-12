export const Button = ({ className, type, children, ...buttonProps }: any) => {
    return (
        <button
            {...buttonProps}
            type={type}
            className={`${className} border-transparent group flex items-center justify-center bg-base-100 px-4 py-3 text-sm font-[500] uppercase text-primary outline-none transition-all duration-200 hover:bg-primary hover:text-white active:scale-95 ${className} disabled:pointer-events-none disabled:text-base-200 disabled:saturate-0`}
        >
            {children}
        </button>
    )
}
