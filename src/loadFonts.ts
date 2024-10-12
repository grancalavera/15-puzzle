// https://stackoverflow.com/questions/74070917/static-urls-to-google-fonts
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
// https://fonts.gstatic.com/s/inter/v18/UcCm3FwrK3iLTcvnUwQT9mI1F54.woff2
export async function loadFonts() {
  const urls = [
    // latin-ext, normal
    [
      "https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcvsYwYZ8UA3J58.woff2",
      "normal",
    ],
    // latin, normal
    [
      "https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwYZ8UA3.woff2",
      "normal",
    ],
    // latin-ext, italic
    [
      "https://fonts.gstatic.com/s/inter/v18/UcCm3FwrK3iLTcvnUwoT9mI1F55MKw.woff2",
      "italic",
    ],
    // latin, italic
    [
      "https://fonts.gstatic.com/s/inter/v18/UcCm3FwrK3iLTcvnUwQT9mI1F54.woff2",
      "italic",
    ],
  ];

  const fontFaces = await Promise.all(
    urls.map(async ([url, style]) => {
      const fontFace = new FontFace("Inter", `url(${url})`, {
        display: "swap",
        weight: "100 900",
        style,
      });
      await fontFace.load();
      return fontFace;
    })
  );
  console.log(fontFaces);
  fontFaces.forEach((fontFace) => document.fonts.add(fontFace));
}
