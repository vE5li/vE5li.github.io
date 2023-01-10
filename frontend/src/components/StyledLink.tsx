import React from "react";
import Link from "@mui/material/Link";

type Props = {
  text: string;
  href: string;
  fontSize: string;
  tabIndex?: number;
  download?: string;
  trigger?: string;
};

function StyledLink({
  text,
  href,
  fontSize,
  tabIndex,
  download,
  trigger,
}: Props) {
  return (
    <Link
      underline="none"
      download={download ? download : false}
      tabIndex={tabIndex ? tabIndex : 0}
      sx={{
        fontSize: { fontSize },
        fontWeight: "bold",
        color: "text.primary",
        "&:focus": { color: "primary.main", outline: "none" },
      }}
      href={href}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          (event.target as any).blur();
        }
      }}
      onClick={() => {
        if (trigger !== undefined) {
          fetch(trigger);
        }
      }}
    >
      {text}
    </Link>
  );
}

export default StyledLink;
