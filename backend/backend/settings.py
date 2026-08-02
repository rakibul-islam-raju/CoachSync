import os
from datetime import timedelta
from pathlib import Path

import environ

# env var casting
env = environ.Env(
    DEBUG=(bool, False),
    CORS_ALLOW_ALL_ORIGINS=(bool, False),
    DATABASE_ENGINE=(str, "sqlite"),
    CELERY_BROKER_URL=(str, "redis://redis:6379/0"),
    CELERY_RESULT_BACKEND=(str, "redis://redis:6379/0"),
)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Take environment variables from .env file
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env("DEBUG")
ENVIRONMENT = env("ENVIRONMENT", default="development")
IS_PRODUCTION = ENVIRONMENT == "production"

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "django_filters",
    "corsheaders",
    # "django_celery_results",
    # local apps
    "user.apps.UserConfig",
    "authentication.apps.AuthenticationConfig",
    "organization.apps.OrganizationConfig",
    "student.apps.StudentConfig",
    "finance.apps.FinanceConfig",
    "utilities.apps.UtilitiesConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # cors middleware
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "utilities.middleware.logger.StatusCodeLoggerMiddleware",
]
if IS_PRODUCTION:
    MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"


# Database. DATABASE_URL takes precedence. DATABASE_ENGINE=postgresql enables
# the explicit PG_* variables used by Compose; SQLite remains convenient for
# an intentionally local, single-process development setup.
DATABASE_URL = env("DATABASE_URL", default="")
DATABASE_ENGINE = env("DATABASE_ENGINE")
if DATABASE_URL:
    database_config = env.db_url_config(DATABASE_URL)
    database_config["CONN_MAX_AGE"] = env.int("DB_CONN_MAX_AGE", default=60)
    database_config["CONN_HEALTH_CHECKS"] = True
    DATABASES = {"default": database_config}
elif DATABASE_ENGINE == "postgresql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("PG_DB"),
            "USER": env("PG_USER"),
            "PASSWORD": env("PG_PASSWORD"),
            "HOST": env("PG_HOST", default="db"),
            "PORT": env.int("PG_PORT", default=5432),
            "CONN_MAX_AGE": env.int("DB_CONN_MAX_AGE", default=60),
            "CONN_HEALTH_CHECKS": True,
        }
    }
    pg_sslmode = env("PG_SSLMODE", default="")
    if pg_sslmode:
        DATABASES["default"]["OPTIONS"] = {"sslmode": pg_sslmode}
else:
    sqlite_path = env("SQLITE_PATH", default=str(BASE_DIR / "db.sqlite3"))
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": sqlite_path,
        }
    }


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Dhaka"
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_ROOT = BASE_DIR / "staticfiles"
STATIC_URL = "/static/"
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Default primary key field type

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "user.User"

PAGE_SIZE = env.int("PAGE_SIZE", default=20)

# REST Framework configs
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "PAGE_SIZE": PAGE_SIZE,
}

# Spectacular configs
SPECTACULAR_SETTINGS = {
    "TITLE": "Coaching Management System",
    "DESCRIPTION": "Your project description",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": "/api/v[0-9]",
    "ENUM_NAME_OVERRIDES": {
        "EnrollmentStatusEnum": "student.models.Enroll.STATUS_CHOICES",
        "ExpenseStatusEnum": "finance.models.Expense.STATUS_CHOICES",
        "ReminderStatusEnum": "finance.models.OverdueReminder.STATUS_CHOICES",
    },
}

# jwt configs
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=3),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
}

# cors headers
CORS_ALLOW_ALL_ORIGINS = env("CORS_ALLOW_ALL_ORIGINS")
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

EMAIL_BACKEND = env(
    "EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend"
)
EMAIL_HOST = env("EMAIL_HOST", default="")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="webmaster@localhost")

# CELERY SETTINGS
CELERY_BROKER_URL = env("CELERY_BROKER_URL")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND")
# CELERY_ACCEPT_CONTENT = {"application/json"}
# CELERY_RESULT_SERIALIZER = "json"
# CELERY_TASK_SERIALIZER = "json"
# CELERY_TIMEZONE = "Asia/Dhaka"
# CELERY_TASK_TRACK_STARTED = True
# CELERY_TASK_TIME_LIMIT = 30 * 60

FRONTEND_BASE_URL = env("FRONTEND_BASE_URL", default="http://localhost:5173")
if not FRONTEND_BASE_URL.startswith(("http://", "https://")):
    FRONTEND_BASE_URL = f"http://{FRONTEND_BASE_URL}"
FRONTEND_BASE_URL = FRONTEND_BASE_URL.rstrip("/")

# Reverse-proxy and browser security. Production defaults are secure; local
# development explicitly opts out through DEBUG=True or environment overrides.
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=IS_PRODUCTION)
SESSION_COOKIE_SECURE = env.bool("SESSION_COOKIE_SECURE", default=IS_PRODUCTION)
CSRF_COOKIE_SECURE = env.bool("CSRF_COOKIE_SECURE", default=IS_PRODUCTION)
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS", default=False
)
SECURE_HSTS_PRELOAD = env.bool("SECURE_HSTS_PRELOAD", default=False)
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
USE_X_FORWARDED_HOST = env.bool("USE_X_FORWARDED_HOST", default=False)
if env.bool("TRUST_PROXY_HEADERS", default=False):
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": env("LOG_LEVEL", default="INFO"),
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": env("LOG_LEVEL", default="INFO"),
            "propagate": False,
        },
        "status_logger": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
