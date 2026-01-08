import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/utils"

const Sheet = ({ open, onOpenChange, children }) => {
    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/50"
                    onClick={() => onOpenChange(false)}
                />
            )}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-xl transition-transform duration-300",
                    open ? "translate-x-0" : "translate-x-full"
                )}
            >
                {children}
            </div>
        </>
    )
}

const SheetContent = ({ children, onClose }) => {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b">
                <button
                    onClick={onClose}
                    className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
    )
}

export { Sheet, SheetContent }
