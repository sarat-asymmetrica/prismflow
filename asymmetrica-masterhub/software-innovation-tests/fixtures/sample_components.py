"""
Sample Component Fixtures

Provides sample React/TypeScript components for testing:
- Production-quality components
- Asymmetrica-annotated code
- Various complexity levels

@complexity O(1) - Static data
@performance Instant
@validation α₀ - Production-ready
"""


def simple_button_component():
    """Simple button component"""
    return '''
import React from 'react';

/**
 * Simple Button Component
 *
 * @complexity O(1) - Static render
 * @performance <1ms render time
 * @validation α₀ - Production ready
 * @regime λ - Stabilization (core UI component)
 */
interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
    return (
        <button
            onClick={onClick}
            className={`btn btn-${variant}`}
            type="button"
        >
            {label}
        </button>
    );
};

export default Button;
'''


def parallax_hero_component():
    """Parallax hero component with GSAP"""
    return '''
import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Parallax Hero Component
 *
 * @complexity O(n) where n = number of layers
 * @performance 60fps parallax scroll guaranteed
 * @validation α₀ - Production ready, validated for smooth scrolling
 * @regime λ - Stabilization (critical landing page component)
 */
interface ParallaxHeroProps {
    layers: Array<{
        image: string;
        speed: number;
        zIndex: number;
    }>;
    title: string;
}

const ParallaxHero: React.FC<ParallaxHeroProps> = ({ layers, title }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        layers.forEach((layer, index) => {
            gsap.to(`.layer-${index}`, {
                y: (index + 1) * 100 * layer.speed,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });
    }, { dependencies: [layers] });

    return (
        <div ref={containerRef} className="parallax-hero">
            {layers.map((layer, index) => (
                <div
                    key={index}
                    className={`layer layer-${index}`}
                    style={{
                        backgroundImage: `url(${layer.image})`,
                        zIndex: layer.zIndex
                    }}
                />
            ))}
            <div className="hero-content">
                <h1>{title}</h1>
            </div>
        </div>
    );
};

export default ParallaxHero;
'''


def data_table_component():
    """Data table with sorting and filtering"""
    return '''
import React, { useState, useMemo } from 'react';

/**
 * Data Table Component
 *
 * @complexity O(n log n) where n = number of rows (sorting)
 * @performance <16ms render for 1000 rows (60fps)
 * @validation α₀ - Production ready with virtualization
 * @regime κ - Optimization (performance-critical data display)
 */
interface Column<T> {
    key: keyof T;
    header: string;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
}

function DataTable<T extends Record<string, any>>({ data, columns }: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const sortedData = useMemo(() => {
        if (!sortKey) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortKey, sortDirection]);

    const handleSort = (key: keyof T) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    return (
        <table className="data-table">
            <thead>
                <tr>
                    {columns.map((col) => (
                        <th
                            key={String(col.key)}
                            onClick={() => col.sortable && handleSort(col.key)}
                        >
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {sortedData.map((row, index) => (
                    <tr key={index}>
                        {columns.map((col) => (
                            <td key={String(col.key)}>{row[col.key]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default DataTable;
'''


def form_with_validation():
    """Form component with validation"""
    return '''
import React, { useState } from 'react';

/**
 * Form with Validation Component
 *
 * @complexity O(n) where n = number of fields
 * @performance <50ms validation per field
 * @validation α₀ - Production ready with accessibility
 * @regime λ - Stabilization (critical user input)
 */
interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password';
    required?: boolean;
    validation?: (value: string) => string | null;
}

interface FormWithValidationProps {
    fields: FormField[];
    onSubmit: (values: Record<string, string>) => void;
}

const FormWithValidation: React.FC<FormWithValidationProps> = ({ fields, onSubmit }) => {
    const [values, setValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (name: string, value: string) => {
        setValues(prev => ({ ...prev, [name]: value }));

        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        fields.forEach(field => {
            const value = values[field.name] || '';

            if (field.required && !value) {
                newErrors[field.name] = `${field.label} is required`;
            } else if (field.validation) {
                const error = field.validation(value);
                if (error) {
                    newErrors[field.name] = error;
                }
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(values);
    };

    return (
        <form onSubmit={handleSubmit}>
            {fields.map(field => (
                <div key={field.name} className="form-field">
                    <label htmlFor={field.name}>{field.label}</label>
                    <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        value={values[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        aria-required={field.required}
                        aria-invalid={!!errors[field.name]}
                    />
                    {errors[field.name] && (
                        <span className="error" role="alert">{errors[field.name]}</span>
                    )}
                </div>
            ))}
            <button type="submit">Submit</button>
        </form>
    );
};

export default FormWithValidation;
'''


def get_all_sample_components():
    """Get all sample components"""
    return {
        "button": simple_button_component(),
        "parallax_hero": parallax_hero_component(),
        "data_table": data_table_component(),
        "form": form_with_validation()
    }
