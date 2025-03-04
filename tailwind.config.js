module.exports = {
    theme: {
        extend: {
            animation: {
                float: 'float 6s ease-in-out infinite',
                'fade-in': 'fadeIn 1s ease-in-out',
                'fade-in-up': 'fadeInUp 1s ease-in-out',
                'blob-1': 'blob1 8s infinite',
                'blob-2': 'blob2 12s infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                fadeInUp: {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                blob1: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '50%': { transform: 'translate(-20px, -20px) scale(1.2)' },
                },
                blob2: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '50%': { transform: 'translate(20px, 20px) scale(1.2)' },
                },
            },
        },
    },
};