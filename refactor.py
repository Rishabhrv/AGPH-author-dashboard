import os
import re

files_to_update = [
    'components/sales/SalesPageCo.tsx',
    'components/profile/ProfilePageCo.tsx',
    'components/books/BookProgressPageCo.tsx',
    'components/reviews/ReviewsPageCo.tsx',
    'components/royalty/RoyaltyPageCo.tsx'
]

replacements = {
    'bg-panel': 'bg-white',
    'bg-cream': 'bg-slate-50',
    'text-ink': 'text-slate-900',
    'border-ink': 'border-slate-300',
    'ring-ink': 'ring-slate-300',
    'shadow-card': 'shadow-sm',
    'rounded-3xl': 'rounded-xl',
    'rounded-2xl': 'rounded-xl',
    'rounded-xl2': 'rounded-xl',
    'bg-ink': 'bg-slate-900',
    'text-muted': 'text-slate-500',
    'bg-gradient-to-r from-ink to-ink/90': 'bg-slate-900',
    'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700': 'bg-slate-900',
    'from-indigo-500 via-purple-500 to-pink-500': 'bg-slate-900',
    'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500': 'bg-[#275697]',
    'indigo-500': '#275697',
    'indigo-600': '#275697',
    'indigo-700': '#275697',
    'indigo-400': '#275697',
    'indigo-800': '#275697',
    'pink-500': '#275697',
    'pink-600': '#275697',
    'rose-600': 'orange-600',
    'rose-50': 'orange-50',
    'rose-400': 'orange-400',
    'text-[#275697]': 'text-[#275697]', # dummy for now
}

for filepath in files_to_update:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (does not exist)")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for old, new in replacements.items():
        # we do a simple string replace for tailwind classes
        # to avoid replacing 'text-ink' inside 'text-ink/50' if we just did regex, 
        # but string replace is fine for these. Actually let's use regex for exact token matching if needed.
        # But for now, a simple string replace is robust enough since these are specific tailwind classes.
        pass
        
    # Let's do a more careful regex replacement for colors with opacity like text-ink/60
    # text-ink/60 -> text-slate-900/60 is invalid tailwind if using arbitrary? No, it works in modern tailwind, 
    # but text-slate-500 is safer.
    content = re.sub(r'bg-panel', 'bg-white', content)
    content = re.sub(r'bg-cream', 'bg-slate-50', content)
    
    # ink with opacity
    content = re.sub(r'text-ink/(\d+)', r'text-slate-500', content) 
    content = re.sub(r'bg-ink/(\d+)', r'bg-slate-100', content)
    content = re.sub(r'border-ink/(\d+)', r'border-slate-200', content)
    content = re.sub(r'ring-ink/(\d+)', r'ring-slate-200', content)
    
    # ink solid
    content = re.sub(r'\btext-ink\b', 'text-slate-900', content)
    content = re.sub(r'\bbg-ink\b', 'bg-slate-900', content)
    content = re.sub(r'\bborder-ink\b', 'border-slate-300', content)
    content = re.sub(r'\bring-ink\b', 'ring-slate-300', content)
    
    content = re.sub(r'shadow-card', 'shadow-sm', content)
    content = re.sub(r'rounded-3xl', 'rounded-xl', content)
    content = re.sub(r'rounded-2xl', 'rounded-xl', content)
    content = re.sub(r'text-muted', 'text-slate-500', content)
    
    # Gradients
    content = content.replace('bg-gradient-to-r from-ink to-ink/90', 'bg-slate-900')
    content = content.replace('bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700', 'bg-slate-900')
    content = content.replace('from-indigo-500 via-purple-500 to-pink-500', 'bg-[#275697]')
    content = content.replace('bg-gradient-to-r from-amber-500 via-orange-500 to-red-500', 'bg-[#275697]')
    
    # Colors
    content = re.sub(r'indigo-\d00', '#275697', content)
    content = re.sub(r'pink-\d00', '#275697', content)
    
    # Action needed (rose -> orange)
    content = content.replace('rose-600', 'orange-600')
    content = content.replace('rose-50', 'orange-50')
    content = content.replace('rose-400', 'orange-400')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated {filepath}")
