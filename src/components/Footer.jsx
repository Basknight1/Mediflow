export default function Footer() {
    return (
        <footer className="bg-neutral text-neutral-content/60 text-center py-6 px-4 text-sm">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <span>© 2024 MediFlow Chile. Todos los derechos reservados.</span>
                <a href="#" className="hover:text-secondary transition-colors duration-200">Privacidad</a>
                <a href="#" className="hover:text-secondary transition-colors duration-200">Términos</a>
                <a href="#" className="hover:text-secondary transition-colors duration-200">Soporte</a>
            </div>
        </footer>
    )
}