window.onerror = (event, source, lineno, colno, error) => {
    navigator.clipboard.writeText(event);
    alert("An error has occurred. The error message has been copied into your clipboard. Please contact the game author.\n\n--------------------\n\n" + event);
}