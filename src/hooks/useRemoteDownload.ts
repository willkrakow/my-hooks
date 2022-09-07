import { useEffect, useRef } from "react";

const useDownload = (targetUrl: string, fileName?: string) => {
    const downloadRef = useRef<HTMLAnchorElement | null>();
    useEffect(() => {
        const a = document.createElement('a');
        fetch(targetUrl)
            .then(r => r.blob())
            .then(blob => {
                const objectUrl = window.URL.createObjectURL(blob);
                a.href = objectUrl

                if (!fileName) {
                    a.target = '__blank'
                } else {
                    a.download = fileName
                }
                document.body.appendChild(a);
                downloadRef.current = a
            })

        return () => {
            downloadRef.current = null;
            document.body.removeChild(a);
        }
    }, [targetUrl, fileName])

    const handleDownload = () => {
        if (downloadRef.current) {
            downloadRef.current.click();
        }
    }

    return handleDownload;
}

export default useDownload;
