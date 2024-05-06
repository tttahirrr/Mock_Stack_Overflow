export const renderTextWithHyperlinks = (text) => {
    const hyperlinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s]+?)\)/g;
    return text.replace(hyperlinkPattern, (match, linkText, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
 };
 