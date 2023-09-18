CREATE TABLE IF NOT EXISTS public.consecutivo
(
    id integer NOT NULL,
    locacion character varying(64) COLLATE pg_catalog."default",
    consecutivo bigint,
    CONSTRAINT consecutivo_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.consecutivo
    OWNER to postgres;