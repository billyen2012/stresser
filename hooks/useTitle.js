import { useEffect, useState } from "react";

export default function useTitle(title) {
  const [_title, setTitle] = useState(title);

  useEffect(() => {
    document.title = _title;
  }, [_title, setTitle]);

  return {
    setTitle,
    title: _title,
  };
}
