import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "react-router-dom";
import React from "react";

export default function PaginationProduct({ link, currentPage, lastPage }) {
    const location = useLocation();
    const search = location.search || "";
    const pageNumbers = [];

    if(lastPage === 1){
        return null;
    }

    if (lastPage > 0) {
        pageNumbers.push(1);
        if (lastPage > 1) pageNumbers.push(2);
    }

    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 2 && i < lastPage - 1) {
            pageNumbers.push(i);
        }
    }

    if (lastPage > 3) {
        pageNumbers.push(lastPage - 1);
        pageNumbers.push(lastPage);
    }

    const uniquePages = [...new Set(pageNumbers)].sort((a, b) => a - b);

    return (
        <div className="flex justify-center items-center mt-6 space-x-1 text-sm">
            {currentPage > 1 && (
                <Link
                    to={(currentPage === 2 ? `${link}` : `${link}page/${currentPage - 1}`) + search}
                    className="px-2 py-1 border rounded-md"
                >
                    <FontAwesomeIcon icon={faAngleLeft} />
                </Link>
            )}
            {uniquePages.map((page, index) => {
                const isActive = page === currentPage;
                const showDots =
                    index > 0 && page - uniquePages[index - 1] > 1;

                return (
                    <React.Fragment key={page}>
                        {showDots && <span className="px-2">...</span>}
                        <Link
                            to={(page === 1 ? `${link}` : `${link}page/${page}`) + search}
                            className={`px-3 py-1 border rounded-md ${isActive ? 'bg-blue-500 text-white font-bold' : ''}`}
                        >
                            {page}
                        </Link>
                    </React.Fragment>
                );
            })}
            {currentPage < lastPage && (
                <Link
                    to={`${link}page/${currentPage + 1}` + search}
                    className="px-2 py-1 border rounded-md"
                >
                    <FontAwesomeIcon icon={faAngleRight} />
                </Link>
            )}
        </div>
    );
}
