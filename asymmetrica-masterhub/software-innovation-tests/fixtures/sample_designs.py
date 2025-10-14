"""
Sample Design Fixtures

Provides sample design data for testing:
- Design tokens
- Component configurations
- Layout specifications

@complexity O(1) - Static data
@performance Instant
@validation α₀ - Production-ready
"""


def glacier_hero_design():
    """Glacier hero section design tokens"""
    return {
        "colors": {
            "primary": "#E8F4F8",
            "secondary": "#4A5F6B",
            "accent": "#A5C9D0",
            "background": "#FFFFFF",
            "text": "#2C3E50"
        },
        "spacing": {
            "fibonacci": [8, 13, 21, 34, 55, 89, 144],
            "base_unit": 8
        },
        "typography": {
            "scale": 1.618,  # PHI ratio
            "base_size": 16,
            "font_family": "Inter, system-ui, sans-serif"
        },
        "layout": {
            "grid": "12-column",
            "gutter": 24,
            "margin": 32,
            "breakpoints": {
                "mobile": 375,
                "tablet": 768,
                "desktop": 1440,
                "widescreen": 1920
            }
        },
        "depth_layers": [
            {
                "layer": "background",
                "elements": ["sky", "ice-gradient"],
                "parallax_speed": 0.3
            },
            {
                "layer": "midground",
                "elements": ["glacier", "mountains"],
                "parallax_speed": 0.6
            },
            {
                "layer": "foreground",
                "elements": ["title", "cta-button"],
                "parallax_speed": 1.0
            }
        ],
        "animations": {
            "library": "gsap",
            "scroll_trigger": True,
            "target_fps": 60
        }
    }


def parallax_component_config():
    """Parallax component configuration"""
    return {
        "component_type": "parallax-hero",
        "layers": 3,
        "animation_library": "gsap",
        "scroll_trigger": {
            "enabled": True,
            "start": "top top",
            "end": "bottom top",
            "scrub": True
        },
        "performance": {
            "target_fps": 60,
            "max_render_time_ms": 16
        },
        "accessibility": {
            "wcag_level": "AA",
            "reduced_motion": True
        }
    }


def card_grid_design():
    """Card grid layout design"""
    return {
        "colors": {
            "card_background": "#FFFFFF",
            "card_border": "#E5E7EB",
            "card_shadow": "rgba(0, 0, 0, 0.1)"
        },
        "layout": {
            "columns": {
                "mobile": 1,
                "tablet": 2,
                "desktop": 3
            },
            "gap": 21,  # Fibonacci
            "card_aspect_ratio": 1.618  # PHI
        },
        "typography": {
            "title_size": 21,
            "body_size": 13,
            "scale": 1.618
        },
        "animations": {
            "hover_lift": 8,  # px
            "transition_duration": 200  # ms
        }
    }


def form_design():
    """Form design tokens"""
    return {
        "colors": {
            "input_border": "#D1D5DB",
            "input_focus": "#3B82F6",
            "input_error": "#EF4444",
            "input_success": "#10B981"
        },
        "spacing": {
            "input_padding": 13,  # Fibonacci
            "field_gap": 21,  # Fibonacci
            "label_margin": 8  # Fibonacci
        },
        "validation": {
            "required_fields": True,
            "inline_validation": True,
            "error_message_position": "below"
        },
        "accessibility": {
            "aria_labels": True,
            "keyboard_navigation": True,
            "screen_reader_optimized": True
        }
    }


def dashboard_layout():
    """Dashboard layout configuration"""
    return {
        "layout": {
            "sidebar_width": 240,
            "header_height": 64,
            "content_padding": 34,  # Fibonacci
            "grid_system": "CSS Grid"
        },
        "colors": {
            "sidebar_bg": "#1F2937",
            "header_bg": "#FFFFFF",
            "content_bg": "#F9FAFB"
        },
        "responsive": {
            "mobile_sidebar": "drawer",
            "tablet_sidebar": "mini",
            "desktop_sidebar": "full"
        },
        "navigation": {
            "type": "vertical",
            "items": [
                {"label": "Dashboard", "icon": "home"},
                {"label": "Documents", "icon": "folder"},
                {"label": "Analytics", "icon": "chart"},
                {"label": "Settings", "icon": "cog"}
            ]
        }
    }


def get_all_sample_designs():
    """Get all sample designs as a dictionary"""
    return {
        "glacier_hero": glacier_hero_design(),
        "parallax_component": parallax_component_config(),
        "card_grid": card_grid_design(),
        "form": form_design(),
        "dashboard": dashboard_layout()
    }
