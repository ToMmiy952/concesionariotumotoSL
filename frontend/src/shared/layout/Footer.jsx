function Footer({ logo, categorias, ayuda, contacto }) {
    return (
        <>
            <footer className="site-footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <img src={logo} alt="Logo tuMotoSL" className="footer-logo" />
                    </div>
                    <nav className="footer-col" aria-label="Categorias">
                        <h3>Categorias</h3>
                        <ul>
                            {categorias.map((categoria) => (
                                <li className="footer-sep" key={categoria.id}>
                                    <a href={categoria.destino}>{categoria.texto}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <nav className="footer-col" aria-label="Ayuda">
                        <h3>Ayuda</h3>
                        <ul>
                            {ayuda.map((ayuda) => (
                                <li className="footer-sep" key={ayuda.id}>
                                    <a href={ayuda.destino}>{ayuda.texto}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="footer-col footer-contacto">
                        <ul>
                            {contacto.map((contacto) => (
                                <li className="footer-sep" key={contacto.id}>
                                    <h3>{contacto.texto}</h3>
                                    <p>{contacto.descripcion}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="footer-redes">
                            <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3V13h2.6v8h3.6z" /></svg></a>
                            <a href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 110 9.8 4.9 4.9 0 010-9.8zm0 8.1a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zm6.2-8.3a1.15 1.15 0 11-2.3 0 1.15 1.15 0 012.3 0z" /></svg></a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 tuMotoSL. Todos los derechos reservados.</p>
                    <p className="creditos">Fotos de motos: Wikimedia Commons (RL GNZLZ, Honda Cambodia - NCX, Toothycardus, Borowskki, Kiran, Rainmaker47 - licencias CC BY / CC BY-SA / dominio publico)</p>
                </div>
            </footer>
        </>
    )
}
export default Footer