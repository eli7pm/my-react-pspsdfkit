import { useEffect, useRef } from "react";

const fetcher = (fontFileName) =>
    fetch(fontFileName).then((r) => {
        if (r.status === 200) {
            return r.blob();
        } else {
            throw new Error();
        }
    });

export default function PdfViewerComponent(props) {
    const containerRef = useRef(null);
    const customFontsRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        let instance, PSPDFKit;
        (async function() {
            PSPDFKit = await import("pspdfkit");
            const customFonts = ["arial.ttf"].map(
                (font) => new PSPDFKit.Font({ name: font, callback: fetcher })
            );

            customFontsRef.current = customFontsRef.current || customFonts
            instance = await PSPDFKit.load({
                // Container where PSPDFKit should be mounted.
                container,
                // The document to open.
                document: props.document,
                customFonts: customFontsRef.current,
                // Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
                baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}/`
            });
            const item = {
                type: "custom",
                title: "apply Ops",
                id: "custom-button",
                onPress: (e) => {
                    instance.applyOperations([
                        {
                            type: "addPage",
                            afterPageIndex: 0, // Add a new page after page 1.
                            backgroundColor: new PSPDFKit.Color({ r: 100, g: 200, b: 255 }), // Set the new page background color.
                            pageWidth: 750,
                            pageHeight: 1000,
                            rotateBy: 0 // No rotation.
                            // Insets are optional.
                        }
                    ]);
                }
            };

            instance.setToolbarItems([...PSPDFKit.defaultToolbarItems, item]);
        })();

        return () => PSPDFKit && PSPDFKit.unload(container);
    }, []);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100vh"}}/>
    );
}
