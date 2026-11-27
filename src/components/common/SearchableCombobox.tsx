import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
    value: string;
    label: string;
    subtitle?: string;
    badge?: string;
    badgeVariant?: 'default' | 'success' | 'warning' | 'danger';
    meta?: string;
    group?: string;
    keywords?: string;
}

export interface ComboboxFilterTab {
    value: string;
    label: string;
}

interface SearchableComboboxProps {
    value: string;
    options: ComboboxOption[];
    onSelect: (option: ComboboxOption) => void;
    onCustomChange?: (customValue: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    filterTabs?: ComboboxFilterTab[];
    activeFilterTab?: string;
    onFilterTabChange?: (value: string) => void;
}

const BADGE_CLASSES: Record<NonNullable<ComboboxOption['badgeVariant']>, string> = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

export const SearchableCombobox = ({
    value,
    options,
    onSelect,
    onCustomChange,
    placeholder = 'Seleccionar...',
    searchPlaceholder = 'Buscar...',
    emptyText = 'No se encontraron coincidencias.',
    disabled = false,
    className,
    filterTabs,
    activeFilterTab,
    onFilterTabChange,
}: SearchableComboboxProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = useMemo(
        () => options.find((opt) => opt.value === value),
        [options, value]
    );

    const filteredOptions = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return options;
        return options.filter((opt) => {
            const haystack = `${opt.label} ${opt.subtitle || ''} ${opt.group || ''} ${opt.keywords || ''}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [options, searchTerm]);

    const groupedOptions = useMemo(() => {
        const hasGroups = filteredOptions.some((opt) => Boolean(opt.group));
        if (!hasGroups) {
            return [{ group: '', items: filteredOptions }];
        }
        const map = new Map<string, ComboboxOption[]>();
        filteredOptions.forEach((opt) => {
            const key = opt.group || 'Otros';
            const current = map.get(key);
            if (current) {
                current.push(opt);
            } else {
                map.set(key, [opt]);
            }
        });
        return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
    }, [filteredOptions]);

    const trimmedSearch = searchTerm.trim();
    const hasExactMatch = useMemo(
        () => options.some((opt) => opt.value.toLowerCase() === trimmedSearch.toLowerCase() || opt.label.toLowerCase() === trimmedSearch.toLowerCase()),
        [options, trimmedSearch]
    );

    useEffect(() => {
        if (!isOpen) return;
        const timer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 0);

        const handleOutsideMouseDown = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideMouseDown);
        return () => {
            window.clearTimeout(timer);
            document.removeEventListener('mousedown', handleOutsideMouseDown);
        };
    }, [isOpen]);

    const handleSelectOption = (option: ComboboxOption) => {
        onSelect(option);
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleUseCustom = () => {
        if (!onCustomChange || !trimmedSearch) return;
        onCustomChange(trimmedSearch);
        setSearchTerm('');
        setIsOpen(false);
    };

    const displayText = selectedOption?.label || value;

    return (
        <div
            ref={containerRef}
            className={cn('relative w-full', className)}
            onKeyDown={(e) => {
                if (e.key === 'Escape' && isOpen) {
                    e.stopPropagation();
                    setIsOpen(false);
                }
            }}
        >
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm ring-offset-background transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    !displayText && 'text-muted-foreground'
                )}
            >
                <span className="truncate flex-1 pr-2">
                    {displayText || placeholder}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
                    {/* Buscador */}
                    <div className="flex items-center border-b border-border px-2.5 py-2 gap-2">
                        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (filteredOptions.length > 0) {
                                        handleSelectOption(filteredOptions[0]);
                                    } else if (onCustomChange && trimmedSearch) {
                                        handleUseCustom();
                                    }
                                }
                            }}
                            placeholder={searchPlaceholder}
                            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Limpiar búsqueda"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Sub-filtros opcionales (por ejemplo categorías de materiales) */}
                    {filterTabs && filterTabs.length > 0 && onFilterTabChange && (
                        <div className="flex flex-wrap gap-1 border-b border-border px-2 py-1.5 bg-muted/30">
                            {filterTabs.map((tab) => {
                                const isActive = activeFilterTab === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => onFilterTabChange(tab.value)}
                                        className={cn(
                                            'rounded px-2 py-0.5 text-[11px] font-medium transition-colors',
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border/60'
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Lista de opciones */}
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                {emptyText}
                            </div>
                        ) : (
                            groupedOptions.map((section) => (
                                <div key={section.group || 'default'} className="space-y-0.5">
                                    {section.group && (
                                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            {section.group}
                                        </div>
                                    )}
                                    {section.items.map((option) => {
                                        const isSelected = option.value === value;
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleSelectOption(option)}
                                                className={cn(
                                                    'flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors',
                                                    'hover:bg-accent hover:text-accent-foreground',
                                                    isSelected && 'bg-accent/70'
                                                )}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mt-0.5 h-3.5 w-3.5 shrink-0 text-primary',
                                                        isSelected ? 'opacity-100' : 'opacity-0'
                                                    )}
                                                />
                                                <div className="min-w-0 flex-1 space-y-0.5">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="truncate font-medium text-foreground">
                                                            {option.label}
                                                        </span>
                                                        {option.meta && (
                                                            <span className="shrink-0 font-semibold text-primary">
                                                                {option.meta}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {(option.subtitle || option.badge) && (
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="truncate text-[11px] text-muted-foreground">
                                                                {option.subtitle}
                                                            </span>
                                                            {option.badge && (
                                                                <span
                                                                    className={cn(
                                                                        'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
                                                                        BADGE_CLASSES[option.badgeVariant || 'default']
                                                                    )}
                                                                >
                                                                    {option.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}

                        {onCustomChange && trimmedSearch && !hasExactMatch && (
                            <button
                                type="button"
                                onClick={handleUseCustom}
                                className="mt-1 flex w-full items-center gap-2 border-t border-border px-2 py-2 text-left text-xs font-medium text-primary hover:bg-accent rounded-sm"
                            >
                                <Plus className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">Usar &ldquo;{trimmedSearch}&rdquo; manualmente</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
