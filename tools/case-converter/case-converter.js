// Case conversion functions
function toUpperCase(text) {
    return text.toUpperCase();
}

function toLowerCase(text) {
    return text.toLowerCase();
}

function toTitleCase(text) {
    return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function toAlternatingCase(text) {
    let result = '';
    let upper = true;
    for (let char of text) {
        if (/[a-zA-Z]/.test(char)) {
            result += upper ? char.toUpperCase() : char.toLowerCase();
            upper = !upper;
        } else {
            result += char;
        }
    }
    return result;
}

function toSentenceCase(text) {
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

function toToggleCase(text) {
    return text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
}

function toCamelCase(text) {
    return text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
        .replace(/^[^a-zA-Z0-9]+/, '');
}

function toPascalCase(text) {
    return text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}

function toSnakeCase(text) {
    return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();
}

function toKebabCase(text) {
    return text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}

// Word and sentence count
function countWords(text) {
    return (text.trim().match(/\b\w+\b/g) || []).length;
}

function countSentences(text) {
    return (text.match(/[.!?]+/g) || []).length;
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const input = document.getElementById('caseInput');
    const output = document.getElementById('caseOutput');
    const caseBtns = document.querySelectorAll('.case-btn[data-case]');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const wordCount = document.getElementById('wordCount');
    const sentenceCount = document.getElementById('sentenceCount');

    let currentCase = 'upper';

    function convertText(caseType, text) {
        switch (caseType) {
            case 'upper': return toUpperCase(text);
            case 'lower': return toLowerCase(text);
            case 'title': return toTitleCase(text);
            case 'alt': return toAlternatingCase(text);
            case 'sentence': return toSentenceCase(text);
            case 'toggle': return toToggleCase(text);
            case 'camel': return toCamelCase(text);
            case 'pascal': return toPascalCase(text);
            case 'snake': return toSnakeCase(text);
            case 'kebab': return toKebabCase(text);
            default: return text;
        }
    }

    function updateOutput() {
        const text = input.value;
        const converted = convertText(currentCase, text);
        output.value = converted;
        wordCount.textContent = `${countWords(converted)} word${countWords(converted) === 1 ? '' : 's'}`;
        sentenceCount.textContent = `${countSentences(converted)} sentence${countSentences(converted) === 1 ? '' : 's'}`;
    }

    // Add event listeners
    if (input) {
        input.addEventListener('input', updateOutput);
    }

    if (caseBtns && caseBtns.length > 0) {
        caseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentCase = btn.getAttribute('data-case');
                caseBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateOutput();
            });
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            output.select();
            document.execCommand('copy');
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 1200);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            input.value = '';
            updateOutput();
        });
    }

    // Initialize default
    updateOutput();
    if (caseBtns && caseBtns.length > 0) {
        caseBtns[0].classList.add('active');
    }
}); 