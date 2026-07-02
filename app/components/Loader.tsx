'use client'

import { useLoader } from "../context/LoaderContext"

const Loader = () => {
    const { isOpenLoader } = useLoader()
    if (isOpenLoader.isOpen == false) {
        return null
    }
    return (
        <div className="fixed inset-0 z-[9999] w-full h-screen flex flex-col justify-center items-center bg-black/20 backdrop-blur-md">
            {(isOpenLoader.title && isOpenLoader.title.length != 0) && <div className="text-2xl text-[#1a2e35] font-bold mb-10">{isOpenLoader.title}</div>}
            <div className="cube-loader">
                <div className="cube-top"></div>
                <div className="cube-wrapper">
                    <span style={{ "--i": 0 } as React.CSSProperties} className="cube-span"></span>
                    <span style={{ "--i": 1 } as React.CSSProperties} className="cube-span"></span>
                    <span style={{ "--i": 2 } as React.CSSProperties} className="cube-span"></span>
                    <span style={{ "--i": 3 } as React.CSSProperties} className="cube-span"></span>
                </div>
            </div>

        </div>
    )
}

export default Loader;