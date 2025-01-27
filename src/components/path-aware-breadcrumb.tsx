"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import React from "react";

const PathAwareBreadcrumb = () => {
  const path = usePathname();
  const pathNames = path?.split("/").filter((segment) => segment) ?? [];
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathNames.map((segment, index) => {
          const isLast = index === pathNames.length - 1;
          const path = "/" + pathNames.slice(0, index + 1).join("/");

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={path}>{segment}</BreadcrumbLink>
                  </>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator key={`${index}-sep`} />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default PathAwareBreadcrumb;
