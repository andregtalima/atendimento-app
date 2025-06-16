package com.atendimento.app.configurations;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.atendimento.app.security.CustomAuthenticationEntryPoint;
import com.atendimento.app.security.JwtAuthFilter;
import com.atendimento.app.services.AuthService;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Classe de configuração de segurança para a aplicação.
 * 
 * <p>
 * Esta classe configura a autenticação, autorização e outras regras de segurança,
 * utilizando o Spring Security. Ela também define beans personalizados, como o
 * {@link JwtAuthFilter}, {@link PasswordEncoder} e {@link AuthenticationManager}.
 * </p>
 * 
 * <p>
 * A autenticação é baseada em JWT (JSON Web Tokens) e a aplicação é
 * configurada como stateless (sem sessões). As rotas são separadas em públicas,
 * de administradores e de usuários.
 * </p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Autowired
    private AuthService authService;

    @Autowired
    private CustomAuthenticationEntryPoint authenticationEntryPoint;

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    // Constantes para rotas públicas e protegidas
    private static final String[] PUBLIC_ROUTES = { "/auth/**" };
    private static final String[] ADMIN_ROUTES = { "/admin/**" };
    private static final String[] USER_ROUTES = { "/user/**", "/atendimentos/**" };
    private static final String[] SUPERVISOR_ROUTES = { "/supervisor/**" };

    /**
     * Configuração principal da cadeia de filtros de segurança.
     * 
     * <p>
     * Este método define as configurações globais de segurança, como CSRF, políticas
     * de sessão, autorização de rotas, filtros personalizados e tratamento de exceções.
     * </p>
     * 
     * @param http Instância do {@link HttpSecurity} para definir regras de segurança.
     * @return {@link SecurityFilterChain} configurado.
     * @throws Exception Caso ocorra algum erro na configuração.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        logger.info("Iniciando configuração de segurança...");

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        //onfigurar CSRF
        configureCsrf(http);

        // Configurar autorização de rotas
        logger.info("Configurando autorização de rotas...");
        configureAuthorization(http);

        // Configurar gerenciamento de sessões
        configureSession(http);

        // Configurar filtros
        logger.info("Configurando filtros de segurança...");
        configureFilters(http);

        // Configurar o provedor de autenticação e tratamento de exceções
        http.authenticationProvider(authenticationProvider())
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(authenticationEntryPoint));

        logger.info("Configuração de segurança concluída com sucesso.");
        return http.build();
    }

    /**
     * Desabilita a proteção CSRF, já que a autenticação é Stateless (JWT).
     * 
     * <p>
     * Como a aplicação utiliza autenticação baseada em tokens JWT, a proteção contra CSRF
     * (Cross-Site Request Forgery) não é necessária.
     * </p>
     * 
     * @param http Instância do {@link HttpSecurity}.
     * @throws Exception Caso ocorra algum erro na configuração.
     */
    private void configureCsrf(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());
    }

    /**
     * Configura as regras de autorização para diferentes rotas.
     * 
     * <p>
     * As rotas são divididas em três categorias:
     * <ul>
     * <li>Rotas públicas: acessíveis sem autenticação (ex.: /auth/**).</li>
     * <li>Rotas de administradores: acessíveis apenas para usuários com o papel
     * "ADMIN".</li>
     * <li>Rotas de usuários: acessíveis para usuários com os papéis "USER" ou
     * "ADMIN".</li>
     * </ul>
     * </p>
     * 
     * @param http Instância do {@link HttpSecurity}.
     * @throws Exception Caso ocorra algum erro na configuração.
     */
    private void configureAuthorization(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_ROUTES).permitAll() // Rotas públicas
                .requestMatchers(ADMIN_ROUTES).hasRole("ADMIN") // Rotas para administradores
                .requestMatchers(USER_ROUTES).hasAnyRole("USER", "ADMIN") // Rotas para usuários e administradores
                .requestMatchers(SUPERVISOR_ROUTES).hasRole("SUPERVISOR") // Rotas para supervisores
                .anyRequest().authenticated() // Qualquer outra rota requer autenticação
        );
    }

    /**
     * Configura o gerenciamento de sessões como Stateless.
     * 
     * <p>
     * Como a autenticação é baseada em JWT, não há necessidade de gerenciar sessões
     * no servidor. Por isso, a política de criação de sessões é configurada como
     * {@link SessionCreationPolicy#STATELESS}.
     * </p>
     * 
     * @param http Instância do {@link HttpSecurity}.
     * @throws Exception Caso ocorra algum erro na configuração.
     */
    private void configureSession(HttpSecurity http) throws Exception {
        http.sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
    }

    /**
     * Configura o filtro personalizado para autenticação JWT.
     * 
     * <p>
     * O {@link JwtAuthFilter} é inserido antes do filtro padrão de autenticação
     * {@link UsernamePasswordAuthenticationFilter}.
     * </p>
     * 
     * @param http Instância do {@link HttpSecurity}.
     * @throws Exception Caso ocorra algum erro na configuração.
     */
    private void configureFilters(HttpSecurity http) throws Exception {
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    }

    /**
     * Configura o codificador de senha utilizando BCrypt.
     * 
     * @return Instância do {@link PasswordEncoder}.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Fator de custo ajustado
    }

    /**
     * Configura o provedor de autenticação utilizando o serviço de autenticação
     * personalizado.
     * 
     * <p>
     * O {@link DaoAuthenticationProvider} é configurado para usar o {@link AuthService}
     * para buscar detalhes do usuário e o {@link PasswordEncoder} para verificar as
     * senhas.
     * </p>
     * 
     * @return Instância do {@link DaoAuthenticationProvider}.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(authService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Configura o CORS para a aplicação, permitindo requisições de origens específicas.
     * 
     * <p>
     * Para desenvolvimento, todas as origens são permitidas. Em produção, substitua
     * "*" por domínios específicos.
     * </p>
     * 
     * @return Instância do {@link CorsConfigurationSource}.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Substituir "*" por domínios específicos em produção
        configuration.addAllowedOriginPattern("*");
        configuration.addAllowedMethod("*"); // Permitir todos os métodos (GET, POST, etc.)
        configuration.addAllowedHeader("*"); // Permitir todos os cabeçalhos
        configuration.setAllowCredentials(true); // Permitir cookies

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Define o bean para o {@link AuthenticationManager}.
     * 
     * <p>
     * O {@link AuthenticationManager} é usado para realizar a autenticação dos usuários
     * com base nas credenciais fornecidas.
     * </p>
     * 
     * @param authenticationConfiguration Instância do {@link AuthenticationConfiguration}.
     * @return Instância do {@link AuthenticationManager}.
     * @throws Exception Caso ocorra algum erro na configuração.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}