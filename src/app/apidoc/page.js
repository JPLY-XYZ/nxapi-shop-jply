'use client'

import { useEffect, useRef } from "react";
import SwaggerUI from "swagger-ui-dist/swagger-ui-es-bundle";
import "swagger-ui-dist/swagger-ui.css";


export default function page() {
    return (
        <div>
            <div className="h-20 grid place-content-center rounded-lg bg-blue-700 text-white text-4xl">
                API Doc
            </div>
            <SwaggerDocs />
        </div>
    );
}




function SwaggerDocs() {
    const uiRef = useRef(null);

    useEffect(() => {
        SwaggerUI({
            url: "/swagger.json",
            domNode: uiRef.current,
            layout: "BaseLayout"
        });
    }, []);

    return <div ref={uiRef} />;
}