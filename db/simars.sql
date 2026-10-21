--
-- PostgreSQL database dump
--

\restrict vtl8fHy6EIz1yAvSTWybswls9JXXWet8h4SVTfepkVWsLWydXRNzofRUzHkzfYC

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-21 13:58:50

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 16484)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16485)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16502)
-- Name: arsip; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arsip (
    id bigint NOT NULL,
    nomor_arsip character varying(100) NOT NULL,
    kode_klasifikasi_id bigint NOT NULL,
    nama_arsip character varying(255) NOT NULL,
    jenis_arsip_id bigint,
    jumlah integer DEFAULT 1 NOT NULL,
    satuan character varying(50),
    kurun_waktu character varying(100),
    tanggal_arsip date,
    tingkat_keaslian character varying(50),
    lokasi_penyimpanan_id bigint,
    file_arsip text,
    status_arsip character varying(50) DEFAULT 'tersimpan'::character varying NOT NULL,
    keterangan text,
    penulis_pengirim character varying(255),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    divisi_id bigint,
    status_retensi character varying(50),
    tanggal_dasar_retensi date,
    tanggal_mulai_aktif date,
    tanggal_selesai_aktif date,
    tanggal_selesai_inaktif date,
    keputusan_retensi character varying(50)
);


ALTER TABLE public.arsip OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16501)
-- Name: arsip_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arsip_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.arsip_id_seq OWNER TO postgres;

--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 220
-- Name: arsip_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arsip_id_seq OWNED BY public.arsip.id;


--
-- TOC entry 238 (class 1259 OID 28154)
-- Name: detail_penyerahan_arsip; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detail_penyerahan_arsip (
    id bigint NOT NULL,
    penyerahan_id bigint NOT NULL,
    kode_klasifikasi_id bigint NOT NULL,
    nama_arsip character varying(255) NOT NULL,
    jenis_arsip_id bigint,
    jumlah integer DEFAULT 1 NOT NULL,
    satuan character varying(50) DEFAULT 'Berkas'::character varying,
    penulis_pengirim character varying(255),
    kurun_waktu character varying(100),
    tanggal_arsip date,
    tingkat_keaslian character varying(50) DEFAULT 'Asli'::character varying,
    lokasi_penyimpanan_id bigint,
    file_arsip text,
    keterangan text,
    arsip_id bigint,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.detail_penyerahan_arsip OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 28153)
-- Name: detail_penyerahan_arsip_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detail_penyerahan_arsip_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detail_penyerahan_arsip_id_seq OWNER TO postgres;

--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 237
-- Name: detail_penyerahan_arsip_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detail_penyerahan_arsip_id_seq OWNED BY public.detail_penyerahan_arsip.id;


--
-- TOC entry 231 (class 1259 OID 17060)
-- Name: divisi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.divisi (
    id bigint NOT NULL,
    kode character varying(50) NOT NULL,
    nama character varying(255) NOT NULL,
    keterangan text,
    aktif boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.divisi OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17059)
-- Name: divisi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.divisi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.divisi_id_seq OWNER TO postgres;

--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 230
-- Name: divisi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.divisi_id_seq OWNED BY public.divisi.id;


--
-- TOC entry 234 (class 1259 OID 17423)
-- Name: jadwal_retensi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jadwal_retensi (
    id bigint NOT NULL,
    kode_klasifikasi_id bigint NOT NULL,
    retensi_aktif integer DEFAULT 0 NOT NULL,
    satuan_retensi_aktif character varying(50) DEFAULT 'Tahun'::character varying NOT NULL,
    dasar_perhitungan character varying(255) DEFAULT 'LANGSUNG'::character varying NOT NULL,
    keterangan_dasar text,
    retensi_inaktif integer DEFAULT 0 NOT NULL,
    satuan_retensi_inaktif character varying(50) DEFAULT 'Tahun'::character varying NOT NULL,
    keterangan_akhir character varying(50) DEFAULT 'PERMANEN'::character varying NOT NULL,
    keterangan_khusus text,
    aktif boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.jadwal_retensi OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17422)
-- Name: jadwal_retensi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jadwal_retensi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jadwal_retensi_id_seq OWNER TO postgres;

--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 233
-- Name: jadwal_retensi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jadwal_retensi_id_seq OWNED BY public.jadwal_retensi.id;


--
-- TOC entry 225 (class 1259 OID 16539)
-- Name: jenis_arsip; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jenis_arsip (
    id bigint NOT NULL,
    nama character varying(100) NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    keterangan text,
    slug character varying(120) NOT NULL
);


ALTER TABLE public.jenis_arsip OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16538)
-- Name: jenis_arsip_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jenis_arsip_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jenis_arsip_id_seq OWNER TO postgres;

--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 224
-- Name: jenis_arsip_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jenis_arsip_id_seq OWNED BY public.jenis_arsip.id;


--
-- TOC entry 223 (class 1259 OID 16522)
-- Name: kode_klasifikasi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kode_klasifikasi (
    id bigint NOT NULL,
    kode character varying(50) NOT NULL,
    nama character varying(255) NOT NULL,
    jenis_klasifikasi character varying(50),
    parent_id bigint,
    keterangan text,
    aktif boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    is_induk boolean DEFAULT false NOT NULL
);


ALTER TABLE public.kode_klasifikasi OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16521)
-- Name: kode_klasifikasi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kode_klasifikasi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kode_klasifikasi_id_seq OWNER TO postgres;

--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 222
-- Name: kode_klasifikasi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kode_klasifikasi_id_seq OWNED BY public.kode_klasifikasi.id;


--
-- TOC entry 227 (class 1259 OID 16553)
-- Name: lokasi_penyimpanan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lokasi_penyimpanan (
    id bigint NOT NULL,
    jenis_lokasi character varying(50) NOT NULL,
    kode character varying(50) NOT NULL,
    nama character varying(255) NOT NULL,
    parent_id bigint,
    keterangan text,
    aktif boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    is_induk boolean DEFAULT false NOT NULL
);


ALTER TABLE public.lokasi_penyimpanan OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16552)
-- Name: lokasi_penyimpanan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lokasi_penyimpanan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lokasi_penyimpanan_id_seq OWNER TO postgres;

--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 226
-- Name: lokasi_penyimpanan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lokasi_penyimpanan_id_seq OWNED BY public.lokasi_penyimpanan.id;


--
-- TOC entry 232 (class 1259 OID 17085)
-- Name: pengaturan_sistem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pengaturan_sistem (
    id integer NOT NULL,
    nama_instansi character varying(255) DEFAULT 'PLN Batam'::character varying NOT NULL,
    nama_sistem character varying(100) DEFAULT 'SIMARS'::character varying NOT NULL,
    deskripsi text,
    tema character varying(20) DEFAULT 'terang'::character varying NOT NULL,
    notifikasi_aktif boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.pengaturan_sistem OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 28134)
-- Name: penyerahan_arsip; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.penyerahan_arsip (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    divisi_id bigint NOT NULL,
    tanggal_penyerahan date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status character varying(50) DEFAULT 'DIBUAT'::character varying NOT NULL,
    pihak_pertama_id bigint,
    pihak_pertama_nama character varying(255),
    pihak_kedua_id bigint,
    pihak_kedua_nama character varying(255),
    sumber_penyerahan character varying(100),
    nomor_berita_acara character varying(100),
    file_berita_acara text,
    keterangan text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.penyerahan_arsip OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 28133)
-- Name: penyerahan_arsip_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.penyerahan_arsip_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.penyerahan_arsip_id_seq OWNER TO postgres;

--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 235
-- Name: penyerahan_arsip_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.penyerahan_arsip_id_seq OWNED BY public.penyerahan_arsip.id;


--
-- TOC entry 229 (class 1259 OID 16571)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id bigint NOT NULL,
    nama character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255),
    password text NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying NOT NULL,
    aktif boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    divisi_id bigint
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16570)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 228
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- TOC entry 4906 (class 2604 OID 16505)
-- Name: arsip id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip ALTER COLUMN id SET DEFAULT nextval('public.arsip_id_seq'::regclass);


--
-- TOC entry 4946 (class 2604 OID 28157)
-- Name: detail_penyerahan_arsip id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_penyerahan_arsip ALTER COLUMN id SET DEFAULT nextval('public.detail_penyerahan_arsip_id_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 17063)
-- Name: divisi id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisi ALTER COLUMN id SET DEFAULT nextval('public.divisi_id_seq'::regclass);


--
-- TOC entry 4933 (class 2604 OID 17426)
-- Name: jadwal_retensi id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_retensi ALTER COLUMN id SET DEFAULT nextval('public.jadwal_retensi_id_seq'::regclass);


--
-- TOC entry 4914 (class 2604 OID 16542)
-- Name: jenis_arsip id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jenis_arsip ALTER COLUMN id SET DEFAULT nextval('public.jenis_arsip_id_seq'::regclass);


--
-- TOC entry 4910 (class 2604 OID 16525)
-- Name: kode_klasifikasi id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kode_klasifikasi ALTER COLUMN id SET DEFAULT nextval('public.kode_klasifikasi_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 16556)
-- Name: lokasi_penyimpanan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lokasi_penyimpanan ALTER COLUMN id SET DEFAULT nextval('public.lokasi_penyimpanan_id_seq'::regclass);


--
-- TOC entry 4942 (class 2604 OID 28137)
-- Name: penyerahan_arsip id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penyerahan_arsip ALTER COLUMN id SET DEFAULT nextval('public.penyerahan_arsip_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 16574)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 5150 (class 0 OID 16485)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b6e62774-9dca-4339-b389-76bcaa2cba27	14be14906b98ca9f083bad10a6d6e5eeca0881604405adab553cdb4df3862653	2026-09-07 08:52:43.101762+07	20260907015243_initial	\N	\N	2026-09-07 08:52:43.069499+07	1
fddebaff-68ee-4a0a-a7ae-c75f79f16089	49aaafa8f29ad8c4bd7a62db068b429ab9c30400071bfb9fc1d7988b4468e0b5	2026-09-07 09:47:56.26884+07	20260907024756_add_jenis_arsip_keterangan	\N	\N	2026-09-07 09:47:56.232028+07	1
363ddff3-e143-42af-8fb2-b2b19191ccf0	fe46ff229cacdce286d3965d75eb22b689a319b4b852d63a5b517ffb13eb091c	2026-10-01 15:07:38.761848+07	20261001080738_add_penyerahan_arsip	\N	\N	2026-10-01 15:07:38.662125+07	1
fa3c8415-316f-4ae5-a8bb-8701f5cedb54	027aaecfaa3d78113305c880ad73e87f2680dd749315d4fcd75b1846acb4bc16	2026-09-07 10:50:21.218406+07	20260907040000_add_jenis_arsip_slug	\N	\N	2026-09-07 10:50:21.187632+07	1
cc307cc9-0bda-4977-9d5d-5339e87bac61	36a11d72afd95f58b2025e7ccafc8ac106a02d67dd358ce4c064e4549d4cf6d9	2026-09-08 11:39:30.072358+07	20260908000000_add_kode_klasifikasi_is_induk	\N	\N	2026-09-08 11:39:30.037574+07	1
152d9819-5552-44da-9fa9-31d67143c30f	7d98ed823a9e2eaebe1c35902d88f601feb645c7ef12abdd39d6fcb52cfe7999	2026-09-09 09:22:16.534514+07	20260909021717_add_divisi	\N	\N	2026-09-09 09:22:16.472259+07	1
ad6ca7f4-6814-4f6b-b408-21eeeaf97da2	9561e8bc78b7694da8315e39cfeec12318536bb436afc66ea1c9c8d68c4a5c13	2026-10-02 09:54:17.296228+07	20261002025400_remove_nomor_penyerahan	\N	\N	2026-10-02 09:54:17.272592+07	1
2078b735-63b8-4e9f-a943-bd3285d69dd3	621bc31242d34b3827e905e781a7b06ec9f2b187f0c1ca00cc13e46fcbe16421	2026-09-09 09:36:56.507498+07	20260909033000_add_arsip_divisi	\N	\N	2026-09-09 09:36:56.497297+07	1
c068aa8f-6dc7-4535-b99f-8b62382201ea	cd9ed4e89496041f0ff78898608dafaf6388a6575d7b71cd3c6d414fb85c789b	2026-09-09 09:46:16.690386+07	20260909040000_complete_lokasi_penyimpanan	\N	\N	2026-09-09 09:46:16.665548+07	1
9f8545d7-339c-4399-b975-e749217780c8	df3b3d478097483075fd53044b6b16fd103d4ca9a45dafb1381e8cac1e2b4396	2026-09-09 10:10:01.250724+07	20260909043000_add_lokasi_penyimpanan_is_induk	\N	\N	2026-09-09 10:10:01.235948+07	1
20696c1b-de0f-45bb-b5ce-69030e8480df	3ada3b98ae63261bcc045c861be4345b971d567a2c62a0fd6486e1ddd2cb325d	2026-09-09 14:02:20.290102+07	20260909060000_add_pengaturan_sistem	\N	\N	2026-09-09 14:02:20.219901+07	1
d790906b-c6b6-4850-bd16-f068463bd131	266c2849e69524091a36a91534cbe68bddcf5a95740d5d58b9247486bd8bc10b	2026-09-14 11:00:36.608138+07	20260914040036_add_jadwal_retensi	\N	\N	2026-09-14 11:00:36.466012+07	1
7c9ac0c1-29d7-4a87-9bc2-8dd87a7e93b8	647cca7ab1d2cc60569ded1624c169c1ce02992c1d3b4f560b727de3939e8783	2026-09-22 10:18:07.131082+07	20260922031807_add_keputusan_retensi	\N	\N	2026-09-22 10:18:07.119846+07	1
aaab4bc1-fe24-41c2-b20d-0e4e1920ab25	786dc742de5114ae3d962cefa896e73e4c57993038a02a5873473ca45f1d32dd	2026-09-30 13:56:54.707538+07	20260930065640_alter_jadwal_retensi_dasar_perhitungan_varchar_255	\N	\N	2026-09-30 13:56:54.681573+07	1
5f416637-d220-4ecf-a364-0f3ee329129d	5c80192dbbc17cdf6c1fbf3a0c042c66e383feb6190b65c5b33b670f56e8e5c8	2026-10-01 10:48:45.931226+07	20261001034830_add_user_divisi	\N	\N	2026-10-01 10:48:45.878244+07	1
\.


--
-- TOC entry 5152 (class 0 OID 16502)
-- Dependencies: 221
-- Data for Name: arsip; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.arsip (id, nomor_arsip, kode_klasifikasi_id, nama_arsip, jenis_arsip_id, jumlah, satuan, kurun_waktu, tanggal_arsip, tingkat_keaslian, lokasi_penyimpanan_id, file_arsip, status_arsip, keterangan, penulis_pengirim, created_at, updated_at, divisi_id, status_retensi, tanggal_dasar_retensi, tanggal_mulai_aktif, tanggal_selesai_aktif, tanggal_selesai_inaktif, keputusan_retensi) FROM stdin;
6	TEST-RETENSI-002	30	TEST-RETENSI 2	\N	6	Lembar	2024	2024-01-01	\N	\N	\N	dihapus	\N	ilham	2026-09-15 02:35:30.649	2026-09-15 03:19:55.926	3	INAKTIF	2024-01-01	2024-01-01	2026-01-01	2027-01-01	\N
5	TEST-RETENSI-001	36	TEST-RETENSI	2	6	Lembar	2021	2021-09-14	\N	\N	\N	dihapus	\N	ilham	2026-09-14 07:53:00.659	2026-09-15 08:51:32.244	3	SELESAI_RETENSI_PERMANEN	\N	\N	\N	\N	\N
8	TEST-RETENSI-003	31	TEST-RETENSI 3	4	6	Lembar	2024	2024-01-01	Fotokopi	10	/uploads/arsip/27b41d7d-5871-467c-a47f-c738ccee3dba.pdf	dihapus	\N	ilham	2026-09-22 08:05:47.429	2026-10-01 03:18:40.619	\N	INAKTIF	2024-01-01	2024-01-01	2026-01-01	2029-01-01	\N
\.


--
-- TOC entry 5169 (class 0 OID 28154)
-- Dependencies: 238
-- Data for Name: detail_penyerahan_arsip; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detail_penyerahan_arsip (id, penyerahan_id, kode_klasifikasi_id, nama_arsip, jenis_arsip_id, jumlah, satuan, penulis_pengirim, kurun_waktu, tanggal_arsip, tingkat_keaslian, lokasi_penyimpanan_id, file_arsip, keterangan, arsip_id, created_at, updated_at) FROM stdin;
91	41	299	test baru	\N	5	Dokumen	test	2000	2026-10-09	Salinan	11	\N	\N	\N	2026-10-09 03:48:42.506	2026-10-09 03:55:46.363
92	42	47	TES NEW	\N	1	Berkas	TES NEW	2025	2026-10-15	Asli	\N	\N	\N	\N	2026-10-15 03:02:53.567	2026-10-15 03:02:53.567
93	43	469	TES1	4	1	Berkas	TES	\N	2026-10-16	Asli	9	/uploads/arsip/3b94fca4-bdc0-4263-af53-92a282b877c8.pdf	TES1	\N	2026-10-16 02:21:31.125	2026-10-16 02:21:31.125
94	44	473	TES 2	\N	1	Berkas	TES2	\N	2026-10-16	Asli	11	/uploads/arsip/c4ab472a-6ee6-4fd4-a327-842f70759f3d.pdf	TES 2	\N	2026-10-16 02:23:00.408	2026-10-16 02:23:00.408
95	45	479	TES3	\N	1	Berkas	TES3	2025	2026-10-16	Asli	\N	/uploads/arsip/45acd462-54cd-4d7a-ad3c-5686feb7a0b7.pdf	TES3	\N	2026-10-16 02:37:01.975	2026-10-16 02:37:01.975
\.


--
-- TOC entry 5162 (class 0 OID 17060)
-- Dependencies: 231
-- Data for Name: divisi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.divisi (id, kode, nama, keterangan, aktif, created_at, updated_at) FROM stdin;
3	SDM	Sumber Daya Manusia	Mengelola administrasi dan pengembangan sumber daya manusia serta kebutuhan kepegawaian perusahaan.	t	2026-09-09 06:35:43.943	2026-09-09 06:35:51.554
7	TI	Teknologi Informasi	\N	t	2026-10-01 09:11:38.659	2026-10-01 09:11:38.659
\.


--
-- TOC entry 5165 (class 0 OID 17423)
-- Dependencies: 234
-- Data for Name: jadwal_retensi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jadwal_retensi (id, kode_klasifikasi_id, retensi_aktif, satuan_retensi_aktif, dasar_perhitungan, keterangan_dasar, retensi_inaktif, satuan_retensi_inaktif, keterangan_akhir, keterangan_khusus, aktif, created_at, updated_at) FROM stdin;
1	30	2	Tahun	Setelah Tidak Berlaku	\N	1	Tahun	PERMANEN	\N	t	2026-09-14 07:28:33.482	2026-09-14 07:28:33.482
2	35	1	Tahun	Setelah Tahun Anggaran Berakhir	\N	1	Tahun	MUSNAH	\N	t	2026-09-14 07:31:20.418	2026-09-14 07:31:20.418
3	36	2	Tahun		\N	3	Tahun	MUSNAH_DENGAN_KETERANGAN_KHUSUS	Musnah, Kecuali Laporan Khusus Yang Berdampak Nasional Permanen	t	2026-09-14 07:42:25.809	2026-09-14 07:42:25.809
4	31	2	Tahun	Setelah Tidak Berlaku	\N	3	Tahun	PERMANEN	\N	t	2026-09-14 07:55:14.801	2026-09-14 07:55:14.801
5	32	0	Tahun	Setelah Tidak Berlaku	\N	3	Tahun	PERMANEN	\N	t	2026-09-14 07:55:42.018	2026-09-14 07:55:42.018
6	33	2	Tahun	Setelah Tidak Berlaku	\N	3	Tahun	PERMANEN	\N	t	2026-09-14 07:56:03.14	2026-09-14 07:56:03.14
7	37	0	Tahun		\N	0	Tahun	MUSNAH	\N	t	2026-09-14 08:04:17.795	2026-09-14 08:04:17.795
8	38	2	Tahun	Setelah Diperbarui	\N	3	Tahun	PERMANEN	\N	t	2026-09-14 08:05:09.958	2026-09-14 08:05:09.958
9	39	2	Tahun	Setelah Diperbarui	\N	3	Tahun	MUSNAH	\N	t	2026-09-14 08:05:45.33	2026-09-14 08:05:45.33
10	40	0	Tahun	Setelah Diperbarui	\N	0	Tahun	MUSNAH	\N	t	2026-09-14 08:06:16.244	2026-09-14 08:06:16.244
11	469	2	Tahun	Setelah Tidak Berlaku	\N	3	Tahun	PERMANEN	\N	t	2026-09-30 03:41:15.599	2026-09-30 03:41:15.599
12	470	2	Tahun	Setelah Tidak Berlaku	\N	3	Tahun	PERMANEN	\N	t	2026-09-30 03:41:49.352	2026-09-30 03:41:49.352
13	471	2	Tahun	Setelah Tidak Berlaku	\N	3	Tahun	PERMANEN	\N	t	2026-09-30 03:42:05.648	2026-09-30 03:42:05.648
14	472	5	Tahun	Setelah Diperbarui	\N	3	Tahun	PERMANEN	\N	t	2026-09-30 03:42:40.808	2026-09-30 03:42:40.808
17	475	5	Tahun	Setelah Diperbarui	\N	5	Tahun	PERMANEN	\N	t	2026-09-30 03:43:42.794	2026-09-30 03:43:42.794
16	474	5	Tahun	Setelah Diperbarui	\N	5	Tahun	PERMANEN	\N	t	2026-09-30 03:43:24.918	2026-09-30 07:21:14.064
18	476	5	Tahun	Setelah Pemeriksaan dan Tindak Lanjut Hasil Pemeriksaan Telah Selesai	\N	5	Tahun	PERMANEN	\N	t	2026-09-30 03:47:01.923	2026-09-30 06:58:26.881
19	477	5	Tahun	Setelah Pemeriksaan dan Tindak Lanjut Hasil Pemeriksaan Telah Selesai	\N	5	Tahun	PERMANEN	\N	t	2026-09-30 06:59:39.973	2026-09-30 06:59:39.973
47	458	2	Tahun	Setelah Diperbarui	\N	3	Tahun	PERMANEN	\N	t	2026-09-30 07:29:19.458	2026-09-30 07:29:19.458
15	473	5	Tahun	Setelah Diperbarui	\N	5	Tahun	PERMANEN	\N	t	2026-09-30 03:42:59.49	2026-09-30 07:01:22.402
20	478	5	Tahun	Setelah Diperbarui	\N	5	Tahun	PERMANEN	\N	t	2026-09-30 07:02:57.028	2026-09-30 07:02:57.028
21	479	5	Tahun	Setelah Diperbarui	\N	5	Tahun	PERMANEN	\N	t	2026-09-30 07:03:21.423	2026-09-30 07:03:21.423
22	480	5	Tahun	Setelah Diperbarui	\N	5	Tahun	PERMANEN	\N	t	2026-09-30 07:03:43.859	2026-09-30 07:03:43.859
23	481	10	Tahun	Setelah Pelaksanaan	\N	10	Tahun	PERMANEN	\N	t	2026-09-30 07:04:21.575	2026-09-30 07:04:21.575
24	482	10	Tahun	Setelah Pelaksanaan	\N	10	Tahun	PERMANEN	\N	t	2026-09-30 07:04:38.476	2026-09-30 07:04:38.476
25	483	10	Tahun	Setelah Pelaksanaan	\N	10	Tahun	PERMANEN	\N	t	2026-09-30 07:04:57.319	2026-09-30 07:04:57.319
26	484	10	Tahun	Setelah Pelaksanaan	\N	10	Tahun	PERMANEN	\N	t	2026-09-30 07:05:23.777	2026-09-30 07:05:23.777
28	486	2	Tahun	Setelah Pelaksanaan	\N	3	Tahun	MUSNAH_DENGAN_KETERANGAN_KHUSUS	Musnah Kecuali Berskala Nasional Permanen	t	2026-09-30 07:06:47.112	2026-09-30 07:06:47.112
27	485	2	Tahun	Setelah Pelaksanaan	\N	3	Tahun	MUSNAH_DENGAN_KETERANGAN_KHUSUS	Musnah Kecuali Berskala Nasional Permanen	t	2026-09-30 07:05:49.149	2026-09-30 07:07:25.55
29	487	2	Tahun	Setelah Pelaksanaan	\N	3	Tahun	MUSNAH_DENGAN_KETERANGAN_KHUSUS	Musnah Kecuali Berskala Nasional Permanen	t	2026-09-30 07:08:15.356	2026-09-30 07:08:15.356
30	488	2	Tahun	Setelah Pelaksanaan	\N	3	Tahun	MUSNAH_DENGAN_KETERANGAN_KHUSUS	Musnah Kecuali Berskala Permanen	t	2026-09-30 07:08:45.936	2026-09-30 07:09:19.679
31	510	3	Tahun	Setelah Seluruh Proses Diselesaikan	\N	7	Tahun	MUSNAH	\N	t	2026-09-30 07:11:15.577	2026-09-30 07:11:15.577
32	511	3	Tahun	Setelah Seluruh Proses Diselesaikan	\N	7	Tahun	MUSNAH	\N	t	2026-09-30 07:11:44.707	2026-09-30 07:11:44.707
33	512	3	Tahun	Setelah Seluruh Proses Diselesaikan	\N	7	Tahun	MUSNAH	\N	t	2026-09-30 07:12:02.763	2026-09-30 07:12:02.763
34	513	3	Tahun	Setelah Seluruh Proses Diselesaikan	\N	7	Tahun	MUSNAH	\N	t	2026-09-30 07:12:31.117	2026-09-30 07:12:31.117
35	154	1	Tahun	Setelah Diperbarui	\N	1	Tahun	MUSNAH	\N	t	2026-09-30 07:13:44.051	2026-09-30 07:13:44.051
36	155	1	Tahun	Setelah Diperbarui	\N	1	Tahun	MUSNAH	\N	t	2026-09-30 07:14:13.968	2026-09-30 07:14:13.968
37	156	1	Tahun	Setelah Diperbarui	\N	1	Tahun	MUSNAH	\N	t	2026-09-30 07:14:35.663	2026-09-30 07:14:35.663
38	157	1	Tahun	Setelah Diperbarui	\N	2	Tahun	MUSNAH	\N	t	2026-09-30 07:15:02.353	2026-09-30 07:15:02.353
39	158	2	Tahun	Setelah Pemeriksaan dan Tindak Lanjut Hasil Pemeriksaan Telah Selesai	\N	8	Tahun	MUSNAH	\N	t	2026-09-30 07:15:51.632	2026-09-30 07:15:51.632
40	159	2	Tahun	Setelah Pemeriksaan dan Tindak Lanjut Hasil Pemeriksaan Telah Selesai	\N	8	Tahun	MUSNAH	\N	t	2026-09-30 07:16:06.183	2026-09-30 07:16:06.183
41	160	2	Tahun	Setelah Dipindahtangankan	\N	8	Tahun	MUSNAH	\N	t	2026-09-30 07:17:54.689	2026-09-30 07:17:54.689
42	161	2	Tahun	Setelah Pemeriksaan dan Tindak Lanjut Hasil Pemeriksaan Telah Selesai	\N	8	Tahun	MUSNAH	\N	t	2026-09-30 07:18:24.658	2026-09-30 07:18:24.658
43	162	2	Tahun	Setelah Pemeriksaan dan Tindak Lanjut Hasil Pemeriksaan Telah Selesai	\N	8	Tahun	MUSNAH	\N	t	2026-09-30 07:19:10.937	2026-09-30 07:19:10.937
44	163	2	Tahun	Setelah Pemeriksaan dan Tindak Lanjut Hasil Pemeriksaan Telah Selesai	\N	8	Tahun	MUSNAH	\N	t	2026-09-30 07:19:35.999	2026-09-30 07:19:35.999
45	164	2	Tahun	Setelah Pemeriksaan dan Tindak Lanjut Hasil Pemeriksaan Telah Selesai	\N	8	Tahun	MUSNAH	\N	t	2026-09-30 07:20:13.704	2026-09-30 07:20:13.704
46	165	2	Tahun	Setelah Pemeriksaan dan Tindak Lanjut Hasil Pemeriksaan Telah Selesai	\N	8	Tahun	MUSNAH	\N	t	2026-09-30 07:20:38.376	2026-09-30 07:20:38.376
48	459	2	Tahun	Setelah Diperbarui	\N	3	Tahun	PERMANEN	\N	t	2026-09-30 07:29:30.055	2026-09-30 07:29:30.055
49	460	2	Tahun	Setelah Diperbarui	\N	3	Tahun	PERMANEN	\N	t	2026-09-30 07:30:09.233	2026-09-30 07:30:09.233
50	461	2	Tahun	Setelah Tidak Beroperasi	\N	3	Tahun	MUSNAH	\N	t	2026-09-30 07:30:51.478	2026-09-30 07:30:51.478
51	462	2	Tahun	Setelah Tidak Beroperasi	\N	3	Tahun	MUSNAH	\N	t	2026-09-30 07:31:03.336	2026-09-30 07:31:03.336
52	463	2	Tahun	Setelah Tidak Beroperasi	\N	3	Tahun	MUSNAH	\N	t	2026-09-30 07:31:14.806	2026-09-30 07:31:14.806
53	464	2	Tahun	Setelah Tidak Beroperasi	\N	3	Tahun	MUSNAH	\N	t	2026-09-30 07:31:45.309	2026-09-30 07:31:45.309
54	465	2	Tahun	Setelah Tidak Beroperasi	\N	3	Tahun	MUSNAH	\N	t	2026-09-30 07:32:03.587	2026-09-30 07:32:03.587
55	466	2	Tahun	Setelah Tidak Beroperasi	\N	3	Tahun	MUSNAH	\N	t	2026-09-30 07:32:38.523	2026-09-30 07:32:38.523
56	467	2	Tahun	Setelah Tidak Beroperasi	\N	3	Tahun	MUSNAH	\N	t	2026-09-30 07:33:24.263	2026-09-30 07:33:24.263
57	468	2	Tahun	Setelah Tidak Beroperasi	\N	3	Tahun	MUSNAH	\N	t	2026-09-30 07:33:39.679	2026-09-30 07:33:39.679
\.


--
-- TOC entry 5156 (class 0 OID 16539)
-- Dependencies: 225
-- Data for Name: jenis_arsip; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jenis_arsip (id, nama, aktif, created_at, updated_at, keterangan, slug) FROM stdin;
3	Surat Keluar	t	2026-09-07 09:03:00.520447	2026-09-07 06:18:31.465	Surat resmi yang dibuat dan dikirimkan kepada pihak terkait.	surat-keluar
4	Nota Dinas	t	2026-09-07 09:03:00.520447	2026-09-07 06:19:52.234	Catatan resmi mengenai kegiatan, kejadian, atau hasil pelaksanaan	nota-dinas
2	Surat Masuk	t	2026-09-07 09:03:00.520447	2026-09-08 03:11:08.603	Surat yang diterima dari pihak internal maupun eksternal	surat-masuk
5	Berita Acara	t	2026-09-07 09:03:00.520447	2026-09-09 06:49:15.477	Komunikasi resmi internal antarbagian dalam instansi\r\ndadwdadawdawdawdawdawdaw\r\nDadawdaw	berita-acara
\.


--
-- TOC entry 5154 (class 0 OID 16522)
-- Dependencies: 223
-- Data for Name: kode_klasifikasi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kode_klasifikasi (id, kode, nama, jenis_klasifikasi, parent_id, keterangan, aktif, created_at, updated_at, is_induk) FROM stdin;
460	DIS.00.01	Penyusunan Kebijakan dan Strategi Transmisi Kelistrikan	Substantif	459	Dokumen/rekaman kegiatan yang berkaitan dengan Penyusunan Kebijakan dan\r\nStrategi Transmisi Kelistrikan, mulai dari kegiatan analisa data dan informasi; kajian\r\ndan analisa; usulan kebijakan, rekomendasi, rumusan dan penyusunan\r\nmateri/bahan; rancangan kebijakan, prosedur/kriteria, dan penetapan.	t	2026-09-29 08:41:39.642	2026-09-29 08:41:39.642	f
28	REN	Perencanaan	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-08 04:44:23.421	2026-09-08 07:54:55.928	t
87	STH	Stakholder Managment / Kehumasan	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 01:46:47.391	2026-09-29 02:24:14.921	t
62	HKM.01	Produk Hukum Eksternal	Fasilitatif	54	\N	t	2026-09-29 01:33:41.466	2026-09-29 01:33:41.466	t
65	HKM.02	Perjanjian Kerjasama/MoU	Fasilitatif	54	\N	t	2026-09-29 01:35:08.76	2026-09-29 01:35:08.76	t
121	KEU	Keauangan	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 02:11:45.045	2026-09-29 02:11:45.045	t
214	MUM.04	Rumah Dinas	Fasilitatif	195	\N	t	2026-09-29 03:20:57.51	2026-09-29 03:20:57.51	t
447	KIT.11	Pembangkit Listrik Tenaga Hidrogen	Substantif	424	\N	t	2026-09-29 08:36:12.943	2026-09-29 08:36:12.943	t
475	AGA.01.03	Ekonomi Energi	Substantif	472	Dokumen/rekaman kegiatan yang berkaitan dengan Ekonomi energi.	t	2026-09-29 08:47:15.684	2026-09-29 08:47:25.296	f
339	MRK	-	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 06:52:14.281	2026-09-29 06:52:14.281	t
340	MRK.01	-	Fasilitatif	339	\N	t	2026-09-29 06:52:43.914	2026-09-29 06:52:43.914	t
342	MRK.02	Program Pengendalian Gratifikasi (PPG)	Fasilitatif	339	\N	t	2026-09-29 06:53:39.502	2026-09-29 06:53:39.502	t
344	MRK.03	Program Whistleblowing System (WBS)	Fasilitatif	339	\N	t	2026-09-29 06:54:28.271	2026-09-29 06:54:28.271	t
346	MRK.04	Laporan Harta Kekayaan Karyawan (LHKPN)	Fasilitatif	339	\N	t	2026-09-29 06:55:25.421	2026-09-29 06:55:25.421	t
348	MRK.05	Fraud Control Plan (Program Anti Korupsi)	Fasilitatif	339	\N	t	2026-09-29 06:56:23.426	2026-09-29 06:56:23.426	t
341	MRK.01.04	Kepatuhan	Fasilitatif	340	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kepatuhan, meliputi:\r\nKepatuhan terhadap Peraturan/Perundang-undangan, dengan data pendukung:\r\nData dan daftar kepatuhan perusahaan/Unit kerja terhadap undang-undangan,\r\nAnalisis kepatuhan perusahaan terhadap perundang-undangan yang berlaku,\r\nLaporan kepatuhan perusahaan; Kepatuhan terhadap Kode Etik Perusahaan, dengan\r\ndata pendukung: Penandatanganan PPI Tahunan karyawan melalui sistem E-PI\r\nDekom, Direksi, karyawan, Penandatanganan PPI Tahunan karyawan, perbantuan\r\nFungsi pengadaaan, Monitoring dan evaluasi kepatuhan terhadap kode etik\r\nperusahaan dan PPI, Laporan pelaksanaan penandatanganan Piagam Pakta\r\nlntegritas tahunan; Program Pengenalan Direksi dan Dewan Komisaris baru, dengan\r\ndata pendukung: Persiapan dokumen yang dilaporkan/diserahkan, Pelaksanaan\r\npengenalan Direksi/Dewan Komisaris baru, Laporan Program Pengenalan Direksi\r\ndan Dewan Komisaris baru.	t	2026-09-29 06:53:08.987	2026-09-29 06:53:08.987	f
343	MRK.02.01	Program Pengendalian Gratifikasi (PPG)	Fasilitatif	342	Dokumen/Rekaman Kegiatan yang berkaitan dengan Program Pengendalian\r\nGratifikasi (PPG), dengan data pendukung meliputi: Persiapan Program\r\nPengendalian Gratifikasi, Pelaksanaan, Monitoring dan Evaluasi Program\r\nPengendalian Gratifikasi, Laporan Pengendalian Gratifikasi, Sosialisasi pedoman\r\npengendalian gratifikasi.	t	2026-09-29 06:54:00.6	2026-09-29 06:54:00.6	f
345	MRK.03.01	Program Whistleblowing System (WBS)	Fasilitatif	344	Dokumen/Rekaman Kegiatan yang berkaitan dengan Program Whistleblowing\r\nSystem (WBS), dengan data pendukung meliputi: Persiapan Program Pengendalian\r\nWBS, Pelaksanaan, Monitoring dan Evaluasi Program Pengendalian WBS, Laporan\r\nPengendalian WBS, Sosialisasi pedoman pengendalian WBS	t	2026-09-29 06:54:49.031	2026-09-29 06:54:49.031	f
347	MRK.04.01	Laporan Harta Kekayaan Karyawan (LHKPN)	Fasilitatif	346	\N	t	2026-09-29 06:55:48.087	2026-09-29 06:55:48.087	f
349	MRK.05.01	Fraud Control Plan (Program Anti Korupsi)	Fasilitatif	348	Dokumen/Rekaman Kegiatan yang berkaitan dengan Fraud Control Plan (Program\r\nAnti Korupsi), dengan data pendukung meliputi: Persiapan Kebijakan/ Pedoman\r\nFCP, Pelaksanaan, Monitoring dan Evaluasi FCP, Laporan FCP, Sosialisasi FCP.	t	2026-09-29 06:56:49.528	2026-09-29 06:56:49.528	f
319	SPI	Pengawasan	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 06:34:59.092	2026-09-29 06:34:59.092	t
317	STI.05	Data Center	Fasilitatif	301	\N	t	2026-09-29 06:33:55.079	2026-09-29 06:33:55.079	t
412	EPL.01.01	Energi Batubara	Substantif	411	Dokumen/rekaman kegiatan yang berkaitan dengan Kegiatan Energi Batubara, mulai\r\ndari perencanaan, pelaksanaan, pengendalian, sampai dengan monitoring	t	2026-09-29 07:29:41.106	2026-09-29 07:29:41.106	f
413	EPL.01.02	Energi Gas	Substantif	411	Dokumen/rekaman kegiatan yang berkaitan dengan Kegiatan Energi Gas, mulai dari\r\nperencanaan, pelaksanaan, pengendalian, sampai dengan monitoring	t	2026-09-29 07:30:01.604	2026-09-29 07:30:01.604	f
410	EPL.00.01	Penyusunan Kebijakan dan Strategi Energi Primer dan Energi Baru dan Terbarukan	Substantif	409	Dokumen/rekaman kegiatan yang berkaitan dengan Penyusunan Kebijakan dan\r\nStrategi Energi Primer dan Energi Baru dan Terbarukan, mulai dari kegiatan analisa\r\ndata dan informasi; kajian dan analisa; usulan kebijakan, rekomendasi, rumusan dan\r\npenyusunan materi/bahan; rancangan kebijakan, prosedur/kriteria, dan penetapan\r\ndalam bentuk norma/standar prosedur atau kriteria	t	2026-09-29 07:28:40.242	2026-09-29 07:28:40.242	f
411	EPL.01	Energi Primer	Substantif	408	\N	t	2026-09-29 07:29:18.602	2026-09-29 07:29:18.602	t
409	EPL.00	Kebijakan dan Strategi Energi Primer dan Energi Baru dan Terbarukan	Substantif	408	\N	t	2026-09-29 07:28:10.449	2026-09-29 07:30:10.637	t
414	EPL.01.03	Energi BBM	Substantif	411	Dokumen/rekaman kegiatan yang berkaitan dengan Kegiatan Energi BBM,mulai dari\r\nperencanaan, pelaksanaan, pengendalian, sampai dengan monitoring.	t	2026-09-29 07:30:43.337	2026-09-29 07:30:43.337	f
415	EPL.02	Pelaksanaan Energi Baru dan Terbarukan	Substantif	408	\N	t	2026-09-29 07:31:20.39	2026-09-29 07:31:20.39	t
408	EPI	Energi Primer dan Terbarukan	Klasifikasi Arsip Fungsi Substantif	\N	\N	t	2026-09-29 07:27:36.017	2026-09-29 07:31:43.772	t
416	EPL.02.01	Air	Substantif	415	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan pengadaan Energi\r\nAir, mulai dari Perencanaan, Pelaksanaan, Pengendalian Pemasokan, dan\r\nMonitoring.	t	2026-09-29 07:32:26.519	2026-09-29 07:32:26.519	f
417	EPL.02.02	Panas Bumi	Substantif	415	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan pengadaan Energi\r\nPanas Bumi, mulai dari Perencanaan, Pelaksanaan, Pengendalian Pemasokan, dan\r\nMonitoring.	t	2026-09-29 07:32:55.008	2026-09-29 07:32:55.008	f
418	EPL.02.03	Angin	Substantif	415	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan pengadaan\r\nEnergi Angin, mulai dari Perencanaan, Pelaksanaan, Pengendalian Pemasokan,\r\ndan Monitoring.	t	2026-09-29 07:33:32.472	2026-09-29 07:33:32.472	f
419	EPL.02.04	Surya	Substantif	415	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan pengadaan\r\nEnergi Surya, mulai dari Perencanaan, Pelaksanaan, Pengendalian Pemasokan,\r\ndan Monitoring.	t	2026-09-29 07:34:36.547	2026-09-29 07:34:36.547	f
420	EPL.02.05	Minyak Nabati	Substantif	415	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan pengadaan\r\nEnergi Minyak Nabati, mulai dari Perencanaan, Pelaksanaan, Pengendalian\r\nPemasokan, dan Monitoring.	t	2026-09-29 07:35:00.612	2026-09-29 07:35:00.612	f
421	EPL.02.06	Gelombang Air Laut	Substantif	415	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan pengadaan\r\nEnergi Gelombang Air Laut, mulai dari Perencanaan, Pelaksanaan, Pengendalian\r\nPemasokan, dan Monitoring.	t	2026-09-29 07:35:20.742	2026-09-29 07:35:20.742	f
422	EPL.02.07	Nuklir	Substantif	415	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan pengadaan\r\nEnergi Nuklir, mulai dari Perencanaan, Pelaksanaan, Pengendalian Pemasokan,\r\ndan Monitoring.	t	2026-09-29 07:35:42.606	2026-09-29 07:35:42.606	f
423	EPL.02.08	Hidrogen	Substantif	415	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan pengadaan\r\nEnergi Hidrogen,mulai dari Perencanaan, Pelaksanaan, Pengendalian Pemasokan,\r\ndan Monitoring.	t	2026-09-29 07:36:00.794	2026-09-29 07:36:00.794	f
425	KIT.00	Kebijakan dan Strategi Pembangkit Listrik	Substantif	424	\N	t	2026-09-29 08:26:54.508	2026-09-29 08:26:54.508	t
426	KIT.00.01	Penyusunan Kebijakan dan Strategi Pembangkit Listrik	Substantif	425	Dokumen/rekaman kegiatan yang berkaitan dengan Penyusunan Kebijakan dan\r\nStrategi Pembangkit Listrik, mulai dari kegiatan analisa data dan informasi; kajian dan\r\nanalisa; usulan kebijakan, rekomendasi, rumusan dan penyusunan materi/bahan;\r\nrancangan kebijakan, prosedur/kriteria, dan penetapan	t	2026-09-29 08:27:13.026	2026-09-29 08:27:13.026	f
427	KIT.01	Pembangkit Listrik Tenaga Air	Substantif	424	\N	t	2026-09-29 08:27:40.396	2026-09-29 08:27:40.396	t
424	KIT	Pembangkit Listrik	Klasifikasi Arsip Fungsi Substantif	\N	\N	t	2026-09-29 08:26:24.601	2026-09-29 08:27:56.268	t
428	KIT.01.01	Pembangkit Listrik Tenaga Air	Substantif	427	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan Pembangkit Listrik\r\nTenaga Air sesuai dengan pembagian wilayah bisnis regionalnya, mulai dari kegiatan\r\nPerencanaan Pembangkit; Pembangunan Pembangkit; Komisioning Pembangkit;\r\nOperasi Pembangkit; dan Pemeliharaan Pembangkit	t	2026-09-29 08:28:24.361	2026-09-29 08:28:24.361	f
429	KIT.02	Pembangkit Listrik Tenaga Uap	Substantif	424	\N	t	2026-09-29 08:28:48.614	2026-09-29 08:28:48.614	t
430	KIT.02.01	Pembangkit Listrik Tenaga Uap	Substantif	429	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan Kegiatan\r\nPembangkit Listrik Tenaga Uap sesuai dengan pembagian wilayah bisnis\r\nregionalnya, mulai dari kegiatan Perencanaan Pembangkit; Pembangunan\r\nPembangkit; Komisioning Pembangkit; Operasi Pembangkit; dan Pemeliharaan\r\nPembangkit.	t	2026-09-29 08:29:19.654	2026-09-29 08:29:19.654	f
431	KIT.03	Pembangkit Listrik Tenaga Gas	Substantif	424	\N	t	2026-09-29 08:29:50.946	2026-09-29 08:29:50.946	t
432	KIT.03.01	Pembangkit Listrik Tenaga Gas	Substantif	431	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan Kegiatan\r\nPembangkit Listrik Tenaga Gas sesuai dengan pembagian wilayah bisnis\r\nregionalnya, mulai dari kegiatan Perencanaan Pembangkit; Pembangunan\r\nPembangkit; Komisioning Pembangkit; Operasi Pembangkit; dan Pemeliharaan\r\nPembangkit.	t	2026-09-29 08:30:17.612	2026-09-29 08:30:17.612	f
433	KIT.04	Pembangkit Listrik Tenaga Gas dan Uap	Substantif	424	\N	t	2026-09-29 08:30:47.206	2026-09-29 08:30:47.206	t
434	KIT.04.01	Pembangkit Listrik Tenaga Gas dan Uap	Substantif	433	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan Kegiatan\r\nPembangkit Listrik Tenaga Gas dan Uap sesuai dengan pembagian wilayah bisnis\r\nregionalnya, mulai dari kegiatan Perencanan Pembangkit; Pembangunan\r\nPembangkit; Komisioning Pembangkit; Operasi Pembangk it ; dan Pemeliharaan\r\nPembangkit.	t	2026-09-29 08:31:15.076	2026-09-29 08:31:15.076	f
435	KIT.05	Pembangkit Listrik Tenaga Diesel	Substantif	424	\N	t	2026-09-29 08:31:40.825	2026-09-29 08:31:40.825	t
436	KIT.05.01	Pembangkit Listrik Tenaga Diesel	Substantif	435	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan kegiatan\r\nPembangkit Listrik Tenaga Diesel sesuai dengan pembagian wilayah bisnis\r\nregionalnya, mulai dari kegiatan Perencanaan Pembangkit; Pembangunan\r\nPembangkit; Komisioning Pembangkit; Operasi Pembangkit; dan Pemeliharaan\r\nPembangkit.	t	2026-09-29 08:32:03.16	2026-09-29 08:32:03.16	f
437	KIT.06	Pembangkit Listrik Tenaga Panas Bumi	Substantif	424	\N	t	2026-09-29 08:32:53.706	2026-09-29 08:32:53.706	t
438	KIT.06.01	Pembangkit Listrik Tenaga Panas Bumi	Substantif	437	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan Kegiatan\r\nPembangkit Listrik Tenaga Panas Bumi sesuai dengan pembagian wilayah bisnis\r\nregionalnya, mulai dari kegiatan Perencanaan Pembangkit; Pembangunan\r\nPembangkit; Komisioning Pembangkit; Operasi Pembangkit; dan Pemeliharaan\r\nPembangkit.	t	2026-09-29 08:33:19.379	2026-09-29 08:33:19.379	f
439	KIT.07	Pembangkit Listrik Tenaga Nuklir	Substantif	424	\N	t	2026-09-29 08:33:35.373	2026-09-29 08:33:35.373	t
440	KIT.07.01	Pembangkit Listrik Tenaga Nuklir	Substantif	439	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan Kegiatan\r\nPembangkit Listrik Tenaga Nuklir sesuai dengan pembagian wilayah bisnis\r\nregionalnya, mulai dari kegiatan Perencanaan Pembangkit; Pembangunan\r\nPembangkit; Komisioning Pembangkit; Operasi Pembangkit; dan Pemeliharaan\r\nPembangkit.	t	2026-09-29 08:33:54.872	2026-09-29 08:33:54.872	f
441	KIT.08	Pembangkit Listrik Tenaga Surya	Substantif	424	\N	t	2026-09-29 08:34:13.825	2026-09-29 08:34:13.825	t
442	KIT.08.01	Pembangkit Listrik Tenaga Surya	Substantif	441	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan kegiatan\r\nPembangkit Listrik Tenaga Surya sesuai dengan pembagian wilayah bisnis\r\nregionalnya mulai dari kegiatan Perencanaan Pembangkit; Pembangunan\r\nPembangkit; Komisioning Pembangkit; Operasi Pembangkit; dan Pemeliharaan\r\nPembangkit.	t	2026-09-29 08:34:32.096	2026-09-29 08:34:32.096	f
443	KIT.09	Pembangkit Listrik Tenaga Batubara	Substantif	424	\N	t	2026-09-29 08:34:46.32	2026-09-29 08:34:46.32	t
444	KIT.09.01	Pembangkit Listrik Tenaga Batubara	Substantif	443	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan Kegiatan\r\nPembangkit Listrik Tenaga Batubara sesuai dengan pembagian wilayah bisnis\r\nregionalnya, mulai dari kegiatan Perencanaan Pembangkit; Pembangunan\r\nPembangkit; Komisioning Pembangkit; Operasi Pembangkit; dan Pemeliharaan\r\nPembangkit	t	2026-09-29 08:35:10.208	2026-09-29 08:35:10.208	f
445	KIT.10	Pembangkit Listrik Tenaga Terbarukan	Substantif	424	\N	t	2026-09-29 08:35:33.238	2026-09-29 08:35:33.238	t
446	KIT.10.01	Pembangkit Listrik Tenaga Terbarukan	Substantif	445	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan Kegiatan\r\nPembangkit Listrik Tenaga Terbarukan sesuai dengan pembagian wilayah bisnis\r\nregionalnya, mulai dari kegiatan Perencanaan Pembangkit; Pembangunan\r\nPembangkit; Komisioning Pembangkit; Operasi Pembangkit; dan Pemeliharaan\r\nPembangkit	t	2026-09-29 08:35:53.97	2026-09-29 08:35:53.97	f
448	KIT.11.01	Pembangkit Listrik Tenaga Hidrogen	Substantif	447	Dokumen/rekaman kegiatan yang berkaitan dengan pelaksanaan Kegiatan\r\nPembangkit Listrik Tenaga Hidrogen sesuai dengan pembagian wilayah bisnis\r\nregionalnya, mulai dari kegiatan Perencanaan Pembangkit; Pembangunan\r\nPembangkit; Komisioning Pembangkit; Operasi Pembangkit; dan Pemeliharaan\r\nPembangkit.	t	2026-09-29 08:36:38.086	2026-09-29 08:36:38.086	f
450	TRS.00	Kebijakan dan Strategi Transmisi Kelistrikan	Substantif	449	\N	t	2026-09-29 08:37:14.823	2026-09-29 08:37:14.823	t
449	TRS	Transmisi Kelistrikan	Klasifikasi Arsip Fungsi Substantif	\N	\N	t	2026-09-29 08:36:50.72	2026-09-29 08:37:38.275	t
451	TRS.00.01	Penyusunan Kebijakan dan Strategi Transmisi Kelistrikan	Substantif	450	Dokumen/rekaman kegiatan yang berkaitan dengan Penyusunan Kebijakan dan\r\nStrategi Transmisi Kelistrikan, mulai dari kegiatan analisa data dan informasi; kajian\r\ndan analisa; usulan kebijakan, rekomendasi, rumusan dan penyusunan\r\nmateri/bahan; rancangan kebijakan, prosedur/kriteria, dan penetapan.	t	2026-09-29 08:38:05.289	2026-09-29 08:38:05.289	f
452	TRS.01	Operasi dan Pemeliharaan Sistem SCADA, Transmisi dan Gardu lnduk	Substantif	449	\N	t	2026-09-29 08:38:27.487	2026-09-29 08:38:27.487	t
453	TRS.01.01	Sistem SCADA	Substantif	452	Dokumen/rekaman kegiatan yang berkaitan dengan Sistem SCADA, mulai dari\r\nkegiatan Perencanaan Sistem SCADA; Pembangunan Sistem SCADA; Komisining\r\nSCADA; Operasi Sistem SCADA; dan Pemeliharaan Sistem SCADA, sesuai\r\ndengan pembagian wilayah bisnis regionalnya	t	2026-09-29 08:38:47.443	2026-09-29 08:38:47.443	f
454	TRS.01.02	Transmisi Tegangan Ekstra Tinggi	Substantif	452	Dokumen/rekaman kegiatan yang berkaitan dengan Transmisi Tegangan Ekstra\r\nTinggi, mulai dari kegiatan Perencanaan Transmisi Tegangan Ekstra Tinggi;\r\nPembangunan Transmisi Tegangan Ekstra Tinggi; Komisining Transmisi Tegangan\r\nEkstra Tinggi; Operasi Transmisi Tegangan Ekstra Tinggi; dan Pemeliharaan\r\nTransmisi Tegangan Ekstra Tinggi, sesuai dengan pembagian wilayah bisnis\r\nregionalnya.	t	2026-09-29 08:39:08.21	2026-09-29 08:39:08.21	f
455	TRS.01.03	Transmisi Tegangan Tinggi	Substantif	452	Dokumen/rekaman kegiatan yang berkaitan dengan Transmisi Tegangan Tinggi,\r\nmulai dari kegiatan Perencanaan Transmisi Tegangan Tinggia; Pembangunan\r\nTransmisi Tegangan Tinggi; Komisining Transmisi Tegangan Tinggi; Operasi\r\nTransmisi Tegangan Tinggi; dan Pemeliharaan Transmisi Tegangan Tinggi, sesuai\r\ndengan pembagian wilayah bisnis regionalnya	t	2026-09-29 08:39:32.096	2026-09-29 08:39:32.096	f
456	TRS.01.04	Gardu lnduk Tegangan Ekstra Tinggi	Substantif	452	Dokumen/rekaman kegiatan yang berkaitan dengan Gardu lnduk Tegangan Ekstra\r\nTinggi, mulai dari kegiatan Perencanaan Gardu lnduk Tegangan Ekstra Tinggi;\r\nPembangunan Gardu lnduk Tegangan Ekstra Tinggi; Komisining Gardu lnduk\r\nTegangan Ekstra Tinggi; Operasi Gardu lnduk Tegangan Ekstra Tinggi; dan\r\nPemeliharaan Gardu lnduk Tegangan Ekstra Tinggi, sesuai dengan pembagian\r\nwilayah bisnis regionalnya.	t	2026-09-29 08:39:50.794	2026-09-29 08:39:50.794	f
457	TRS.01.05	Gardu lnduk Tegangan Tinggi	Substantif	452	Dokumen/rekaman kegiatan yang berkaitan dengan Gardu lnduk Tegangan Tinggi,\r\nmulai dari kegiatan Perencanaan Gardu lnduk Tegangan Tinggi; Pembangunan\r\nGardu lnduk Tegangan Tinggi; Komisining Gardu lnduk Tegangan Tinggi; Operasi\r\nGardu lnduk Tegangan Tinggi; dan Pemeliharaan Gardu lnduk Tegangan Tinggi,\r\nsesuai dengan pembagian wilayah bisnis regionalnya.	t	2026-09-29 08:40:17.882	2026-09-29 08:40:17.882	f
459	DIS.00	Kebijakan dan Strategi Distribusi Kelistrikan	Substantif	458	\N	t	2026-09-29 08:41:22.065	2026-09-29 08:41:22.065	t
461	DIS.01	Distribusi	Substantif	458	\N	t	2026-09-29 08:41:58.45	2026-09-29 08:41:58.45	t
462	DIS.01.01	Distribusi Jaringan Tegangan Menengah	Substantif	461	Dokumen/rekaman kegiatan yang berkaitan dengan Distribusi Jaringan\r\nTegangan Menengah, mulai dari kegiatan Perencanaan Distribusi;\r\nPembangunan Distribusi; Komisining Distribusi; Operasi Distribusi; dan\r\nPemeliharaan Distribusi, sesuai dengan pembagian wilayah bisnis regionalnya.	t	2026-09-29 08:42:32.015	2026-09-29 08:42:32.015	f
458	DIS	Distribusi	Klasifikasi Arsip Fungsi Substantif	\N	\N	t	2026-09-29 08:40:43.676	2026-09-29 08:42:42.524	t
463	DIS.01.02	Distribusi Jaringan Tegangan Rendah	Substantif	461	Dokumen/rekaman kegiatan yang berkaitan dengan Distribusi Jaringan\r\nTegangan Menengah, mulai dari kegiatan Perencanaan Distribusi;\r\nPembangunan Distribusi; Komisining Distribusi; Operasi Distribusi; dan\r\nPemeliharaan Distribusi, sesuai dengan pembagian wilayah bisnis regionalnya.	t	2026-09-29 08:43:20.774	2026-09-29 08:43:20.774	f
464	DIS.01.03	Distribusi Saluran Rumah Tangga	Substantif	461	Dokumen/rekaman kegiatan yang berkaitan dengan Distribusi Jaringan\r\nTegangan Menengah, mulai dari kegiatan Perencanaan Distribusi;\r\nPembangunan Distribusi; Komisining Distribusi; Operasi Distribusi; dan\r\nPemeliharaan Distribusi, sesuai dengan pembagian wilayah bisnis regionalnya	t	2026-09-29 08:43:37.622	2026-09-29 08:43:37.622	f
465	DIS.02	Proteksi Distribusi	Substantif	458	\N	t	2026-09-29 08:43:59.787	2026-09-29 08:43:59.787	t
466	DIS.02.01	Proteksi Distribusi	Substantif	465	Dokumen/rekaman kegiatan yang berkaitan dengan Proteksi Distribusi, yang\r\nmeliputi antara lain: Sistem Proteksi.	t	2026-09-29 08:44:17.242	2026-09-29 08:44:17.242	f
467	DIS.03	Gardu Distribusi	Substantif	458	\N	t	2026-09-29 08:44:35.705	2026-09-29 08:44:35.705	t
468	DIS.03.01	Gardu Distribusi	Substantif	467	Dokumen/rekaman kegiatan yang berkaitan dengan Gardu Distribusi, mulai dari\r\nPerencanaan Gardu Distribusi; Pembangunan Gardu Distribusi; Komisining Gardu\r\nDistribusi; Operasi Distribusi; dan Pemeliharaan Gardu Distribusi, sesuai dengan\r\npembagian wilayah bisnis regionalnya	t	2026-09-29 08:44:57.013	2026-09-29 08:44:57.013	f
469	AGA	NIAGA	Klasifikasi Arsip Fungsi Substantif	\N	\N	t	2026-09-29 08:45:25.197	2026-09-29 08:45:31.474	t
470	AGA.00	Kebijakan Niaga	Substantif	469	\N	t	2026-09-29 08:45:48.68	2026-09-29 08:45:48.68	t
471	AGA.00.01	Penyusunan Kebijakan Niaga	Substantif	470	Dokumen/rekaman kegiatan yang berkaitan dengan Penyusunan Kebijakan Niaga\r\nmeliputi kebijakan pemasaran dan Kebijakan Tarif mulai dari proses pengkajian,\r\npengusulan kebijakan, naskah akademik, penyusunan kebijakan, perumusan,\r\nsampai dengan penetapan.	t	2026-09-29 08:46:06.355	2026-09-29 08:46:06.355	f
472	AGA.01	Strategi Pemasaran	Substantif	469	\N	t	2026-09-29 08:46:21.718	2026-09-29 08:46:21.718	t
473	AGA.01.01	Survei Pasar	Substantif	472	Dokumen/rekaman kegiatan yang berkaitan dengan Survei Pasar.	t	2026-09-29 08:46:41.038	2026-09-29 08:46:41.038	f
474	AGA.01.02	Riset Pasar	Substantif	472	Dokumen/rekaman kegiatan yang berkaitan dengan Riset Pasar, mulai dari\r\npengumpulan data sampai dengan hasil riset pasar	t	2026-09-29 08:46:55.969	2026-09-29 08:46:55.969	f
476	AGA.02	Public Service Obligation (PSO)	Substantif	469	\N	t	2026-09-29 08:47:48.526	2026-09-29 08:47:48.526	t
510	CSR	Corporate Social Responsibility	Klasifikasi Arsip Fungsi Substantif	\N	\N	t	2026-09-29 09:05:10.32	2026-09-29 09:05:18.199	t
477	AGA.02.01	Public Service Obligation (PSO)	Substantif	476	Dokumen/rekaman kegiatan yang berkaitan dengan Public Service Obligation\r\n(PSO), meliputi Perencanaan Subsidi; Penagihan Subsidi, dan Pelaporan Subsidi.	t	2026-09-29 08:48:12.794	2026-09-29 08:48:12.794	f
478	AGA.03	Tarif	Substantif	469	\N	t	2026-09-29 08:48:37.891	2026-09-29 08:48:37.891	t
479	AGA.03.01	Rencana Tarif	Substantif	478	Dokumen/rekaman kegiatan yang berkaitan dengan Rencana Tarif.	t	2026-09-29 08:48:53.469	2026-09-29 08:48:53.469	f
480	AGA.03.02	Tarif	Substantif	478	Dokumen/rekaman kegiatan yang berkaitan dengan penentuan Tarif, meliputi:\r\nRencana Tarif; lmplementasi dan Kebijakan Tarif.	t	2026-09-29 08:49:09.175	2026-09-29 08:49:09.175	f
481	AGA.04	Pengelolaan Niaga	Substantif	469	\N	t	2026-09-29 08:49:25.14	2026-09-29 08:49:25.14	t
482	AGA.04.01	Pengelolaan Pelanggan	Substantif	481	Dokumen/rekaman kegiatan yang berkaitan dengan Pengelolaan Pelanggan,\r\nmeliputi: Pasang Baru, SPJBTL, dan Perubahan Data Pelanggan; Manajemen\r\nCatat Meter; Manajemen Billing/Pengelolaan Transaksi Jual Beli kWh; dan Tingkat\r\nMutu Pelayanan (TMP).	t	2026-09-29 08:49:47.511	2026-09-29 08:49:47.511	f
483	AGA.04.02	Manajemen Piutang/Pengelolaan dan Pengawasan Arus Pendapatan	Substantif	481	Dokumen/rekaman kegiatan yang berkaitan dengan Manajemen\r\nPiutang/Pengelolaan dan Pengawasan Arus Pendapatan, meliputi: Terpusat\r\n(P2APST), Revenue Assurance.	t	2026-09-29 08:50:05.93	2026-09-29 08:50:05.93	f
484	AGA.04.03	Manajemen Pemutusan dan Penyambungan	Substantif	481	Dokumen/rekaman kegiatan yang berkaitan dengan Manajemen Pemutusan dan\r\nPenyambungan.	t	2026-09-29 08:50:26.7	2026-09-29 08:50:26.7	f
485	AGA.05	Pelayanan Pelanggan	Substantif	469	\N	t	2026-09-29 08:50:50.771	2026-09-29 08:50:50.771	t
486	AGA.05.01	Contact Center/Info Pelanggan	Substantif	485	Dokumen/rekaman kegiatan yang berkaitan dengan Contact Center/Info\r\nPelanggan	t	2026-09-29 08:51:37.619	2026-09-29 08:51:37.619	f
487	AGA.05.02	Aplikasi Pengaduan Keluhan Terpadu (APKT)	Substantif	485	Dokumen/rekaman kegiatan yang berkaitan dengan Aplikasi Pengaduan Keluhan\r\nTerpadu (APKT).	t	2026-09-29 08:51:58.617	2026-09-29 08:51:58.617	f
488	AGA.05.03	Tingkat Mutu Pelayanan (TMP)	Substantif	485	Dokumen/rekaman kegiatan yang berkaitan dengan Tingkat Mutu Pelayanan\r\n(TMP).	t	2026-09-29 08:52:14.608	2026-09-29 08:52:14.608	f
504	LIT.03.01	Feasibility Study	Substantif	503	Dokumen/rekaman kegiatan yang berkaitan dengan kegiatan Feasibility Study\r\ndalam rangka pengembangan, meliputi studi kelayakan, dan studi lokasi.	t	2026-09-29 09:02:50.419	2026-09-29 09:02:50.419	f
489	LIT	Penelitian Dan Pengembangan (LITBANG)	Klasifikasi Arsip Fungsi Substantif	\N	\N	t	2026-09-29 08:52:27.949	2026-09-29 08:53:43.108	t
490	LIT.00	Penelitian	Substantif	489	\N	t	2026-09-29 08:53:11.654	2026-09-29 08:54:44.562	t
492	LIT.00.02	Penelitian Sistem Pembangkitan	Substantif	490	Dokumen/rekaman kegiatan yang berkaitan dengan Penelitian Sistem\r\nPembangkitan, mulai dari kegiatan survei, pengumpulan data, pengolahan data,\r\nsampai dengan penyusunan laporan hasil Penelitian Sistem Pembangkitan.	t	2026-09-29 08:55:45.144	2026-09-29 08:55:45.144	f
491	LIT.00.01	Penelitian Energi Primer dan Energi Terbarukan	Substantif	490	Dokumen/rekaman kegiatan yang berkaitan dengan Penelitian Energi Primer dan\r\nEnergi Terbarukan, mulai dari kegiatan survei, pengumpulan data, pengolahan\r\ndata, sampai dengan penyusunan laporan hasil penelitian energi primer dan energi\r\nterbarukan.	t	2026-09-29 08:54:25.884	2026-09-29 08:56:11.458	f
493	LIT.00.03	Penelitian Sistem Transmisi dan Distribusi	Substantif	490	Dokumen/rekaman kegiatan yang berkaitan dengan Penelitian Sistem Transmisi\r\ndan Distribusi, mulai dari kegiatan survei, pengumpulan data, pengolahan data,\r\nsampai dengan penyusunan laporan hasil Penelitian Sistem Transmisi dan\r\nDistribusi.	t	2026-09-29 08:56:59.25	2026-09-29 08:56:59.25	f
494	LIT.00.04	Penelitian Lingkungan Hidup	Substantif	490	Dokumen/rekaman kegiatan yang berkaitan dengan Penelitian Lingkungan Hidup,\r\nmulai dari kegiatan survei, pengumpulan data, pengolahan data, sampai dengan\r\npenyusunan laporan hasilPenelitian Lingkungan Hidup	t	2026-09-29 08:57:24.574	2026-09-29 08:57:24.574	f
495	LIT.01	Pengujian	Substantif	489	\N	t	2026-09-29 08:58:04.627	2026-09-29 08:58:04.627	t
496	LIT.01.01	Pengujian Energi Primer dan Energi Terbarukan	Substantif	495	Dokumen/rekaman kegiatan yang berkaitan dengan Pengujian Energi Primer dan\r\nEnergi Terbarukan, mulai dari perencanaan, pelaksanaan pengujian, sampai\r\ndengan penyusunan laporan hasil Pengujian Energi Primer dan Energi Terbarukan.	t	2026-09-29 08:58:33.197	2026-09-29 08:58:33.197	f
497	LIT.01.02	Pengujian Sistem Pembangkitan	Substantif	495	Dokumen/rekaman kegiatan yang berkaitan dengan Pengujian Sistem\r\nPembangkitan mulai dari perencanaan, pelaksanaan pengujian, sampai dengan\r\npenyusunan laporan hasil Pengujian Sistem Pembangkitan	t	2026-09-29 08:58:58.278	2026-09-29 08:58:58.278	f
498	LIT.01.03	Pengujian Sistem Transmisi dan Distribusi	Substantif	495	Dokumen/rekaman kegiatan yang berkaitan dengan Pengujian Sistem Transmisi\r\ndan Distribusi mulai dari perencanaan, pelaksanaan pengujian, sampai dengan\r\npenyusunan laporan hasil Pengujian Sistem Transmisi dan Distribusi	t	2026-09-29 08:59:16.773	2026-09-29 08:59:39.173	f
499	LIT.01.04	Penelitian Lingkungan Hidup	Substantif	495	Dokumen/rekaman kegiatan yang berkaitan dengan Pengujian Penelitian\r\nLingkungan Hidup mulai dari perencanaan, pelaksanaan pengujian, sampai dengan\r\npenyusunan laporan hasil Pengujian Penelitian Lingkungan Hidup.	t	2026-09-29 09:00:26.32	2026-09-29 09:00:26.32	f
500	LIT.02	Kalibrasi	Substantif	489	\N	t	2026-09-29 09:01:01.23	2026-09-29 09:01:01.23	t
501	LIT.02.01	Kalibrasi Sistem Pembangkitan	Substantif	500	Dokumen/rekaman kegiatan yang berkaitan dengan Kalibrasi Sistem\r\nPembangkitan	t	2026-09-29 09:01:22.347	2026-09-29 09:01:22.347	f
502	LIT.02.02	Kalibrasi Sistem Transmisi dan Distribusi	Substantif	500	Dokumen/rekaman kegiatan yang berkaitan dengan Kalibrasi Sistem Transmisi dan\r\nDistribusi.	t	2026-09-29 09:01:45.874	2026-09-29 09:01:45.874	f
503	LIT.03	Pengembangan	Substantif	489	\N	t	2026-09-29 09:02:27.618	2026-09-29 09:02:27.618	t
505	LIT.03.02	Persetujuan Pemegang Saham	Substantif	503	Dokumen/rekaman kegiatan yang berkaitan dengan Persetujuan Pemegang\r\nSaham, mulai dari permohonan persetujuan, notulen rapat, dan persetujuan RUPS.	t	2026-09-29 09:03:17.755	2026-09-29 09:03:17.755	f
506	LIT.03.03	Persiapan Proyek	Substantif	503	Dokumen/rekaman kegiatan mengenai Persiapan yang berkaitan dengan kegiatan\r\nProyek, mulai dari pembentukan tim, notulen rapat, dan laporan.	t	2026-09-29 09:03:37.294	2026-09-29 09:03:37.294	f
507	LIT.04	Standardisasi Ketenagalistrikan	Substantif	489	\N	t	2026-09-29 09:04:11.791	2026-09-29 09:04:11.791	t
508	LIT.04.01	Standardisasi Sistem Pembangkitan	Substantif	507	Dokumen/rekaman kegiatan yang berkaitan dengan Standardisasi Sistem\r\nPembangkitan.	t	2026-09-29 09:04:38.005	2026-09-29 09:04:38.005	f
509	LIT.04.02	Standardisasi Sistem Transmisi dan Distribusi	Substantif	507	Dokumen/rekaman kegiatan yang berkaitan dengan Standardisasi Sistem\r\nTransmisi dan Distribusi.	t	2026-09-29 09:04:55.648	2026-09-29 09:04:55.648	f
511	CSR.00	Pelaksanaan CSR	Substantif	510	\N	t	2026-09-29 09:05:36.005	2026-09-29 09:05:36.005	t
196	MUM.00	Penataan Ruang	Fasilitatif	195	\N	t	2026-09-29 03:13:46.235	2026-09-29 03:13:46.235	t
512	CSR.00.01	Pengelolaan Program CSR	Substantif	511	Dokumen/rekaman kegiatan yang berkaitan dengan Pengelolaan Program CSR.	t	2026-09-29 09:05:54.034	2026-09-29 09:05:54.034	f
513	CSR.00.02	Laporan CSR	Substantif	511	Dokumen/rekaman berupa laporan yang berkaitan dengan Program CSR.	t	2026-09-29 09:06:16.042	2026-09-29 09:06:16.042	f
54	HKM	Hukum	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 01:27:26.486	2026-09-29 01:27:26.486	t
41	ORG	Organisasi dan Tatalaksana	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 01:18:00.495	2026-09-29 01:18:54.494	t
154	DAN	Pengadaan	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 02:39:50.327	2026-09-29 02:39:50.327	t
166	LOG	Logistik	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 02:49:11.458	2026-09-29 02:49:11.458	t
174	MNJ	Manajemen	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 02:57:10.83	2026-09-29 02:57:45.796	t
195	MUM	Umum / Kerumahtangaan	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 03:12:58.166	2026-09-29 03:13:53.057	t
223	SDM	Sumber Daya Manusia	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 03:24:33.65	2026-09-29 03:24:33.65	t
288	DLT	Pendidikan dan Pelatihan (DIKLAT)	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 04:42:54.989	2026-09-29 04:42:54.989	t
301	STI	Teknologi dan Informasi	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 04:47:49.658	2026-09-29 06:24:12.735	t
350	KBL	Kemitraan dan Bina Lingkungan	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 06:57:28.425	2026-09-29 06:57:28.425	t
365	KLH	Kesehatan, Keselamatan & Keamanan Kerja	Klasifikasi Arsip Fungsi Fasilitatif	\N	\N	t	2026-09-29 07:06:57.211	2026-09-29 07:06:57.211	t
29	REN.00	Rencana Kerja Perusahaan	Fasilitatif	28	\N	t	2026-09-08 04:44:46.415	2026-09-08 07:13:49.389	t
34	REN.01	Laporan	Fasilitatif	28	\N	t	2026-09-14 07:18:35.672	2026-09-14 07:19:38.137	t
42	ORG.00	Organisasi	Fasilitatif	41	\N	t	2026-09-29 01:18:29.255	2026-09-29 01:19:02.767	t
46	ORG.01	Tata Laksana	Fasilitatif	41	\N	t	2026-09-29 01:21:14.615	2026-09-29 01:21:14.615	t
55	HKM.00	Produk Hukum Internal	Fasilitatif	54	\N	t	2026-09-29 01:27:54.394	2026-09-29 01:27:54.394	t
68	HKM.03	Sosialisasi Hukum	Fasilitatif	54	\N	t	2026-09-29 01:36:24.397	2026-09-29 01:37:13.094	t
70	HKM.04	KasusISengketa Hukum	Fasilitatif	54	\N	t	2026-09-29 01:37:49.943	2026-09-29 01:37:49.943	t
73	HKM.05	Bantuan Hukum, Konsultasi Hukum dan Kajian Hukum	Fasilitatif	54	\N	t	2026-09-29 01:39:07.078	2026-09-29 01:39:07.078	t
77	HKM.06	Dokumentasi Hukum	Fasilitatif	54	\N	t	2026-09-29 01:41:15.942	2026-09-29 01:41:15.942	t
79	HKM.07	Perizinan	Fasilitatif	54	\N	t	2026-09-29 01:42:16.546	2026-09-29 01:42:16.546	t
83	HKM.08	Hak Atas Kekayaan lntelektual (HAKI)	Fasilitatif	54	\N	t	2026-09-29 01:44:20.391	2026-09-29 01:44:20.391	t
88	STH.00	Keprotokolan	Fasilitatif	87	\N	t	2026-09-29 01:48:06.545	2026-09-29 01:53:49.153	t
91	STH.01	Hubungan Antar Lembaga	Fasilitatif	87	\N	t	2026-09-29 01:54:44.553	2026-09-29 01:54:44.553	t
97	STH.02	Rapat Dengar Pendapat	Fasilitatif	87	\N	t	2026-09-29 01:57:16.61	2026-09-29 01:57:16.61	t
100	STH.03	Publikasi	Fasilitatif	87	\N	t	2026-09-29 01:58:46.588	2026-09-29 01:58:46.588	t
107	STH.04	Sponsorship	Fasilitatif	87	\N	t	2026-09-29 02:03:34.172	2026-09-29 02:03:34.172	t
109	STH.05	Pameran	Fasilitatif	87	\N	t	2026-09-29 02:04:15.25	2026-09-29 02:04:15.25	t
112	STH.06	Dokumentasi/Liputan	Fasilitatif	87	\N	t	2026-09-29 02:06:43.367	2026-09-29 02:06:43.367	t
114	STH.07	PengaduanMasyarakat	Fasilitatif	87	\N	t	2026-09-29 02:07:44.168	2026-09-29 02:07:44.168	t
117	STH.08	Cenderamata	Fasilitatif	87	\N	t	2026-09-29 02:08:56.97	2026-09-29 02:08:56.97	t
119	STH.09	Ucapan terima kasih, ucapan selamat, belasungkawa dan permohonan maaf	Fasilitatif	87	\N	t	2026-09-29 02:09:40.754	2026-09-29 02:09:40.754	t
122	KEU.00	Rencana Kerja Anggaran Perusahaan (RKAP)	Fasilitatif	121	\N	t	2026-09-29 02:12:36.407	2026-09-29 02:12:36.407	t
126	KEU.01	Pelaksanaan Anggaran	Fasilitatif	121	\N	t	2026-09-29 02:15:01.738	2026-09-29 02:15:01.738	t
138	KEU.02	Laporan Keuangan	Fasilitatif	121	\N	t	2026-09-29 02:19:54.54	2026-09-29 02:19:54.54	t
146	KEU.03	Bukti Dokumen Transaksi	Fasilitatif	121	\N	t	2026-09-29 02:23:52.619	2026-09-29 02:23:52.619	t
150	KEU.04	Sistem Akutansi Perusahaan	Fasilitatif	121	\N	t	2026-09-29 02:25:56.503	2026-09-29 02:25:56.503	t
155	DAN.00	Perencanaan Pengadaan	Fasilitatif	154	\N	t	2026-09-29 02:40:14.931	2026-09-29 02:40:14.931	t
158	DAN.01	Pengadaan Barang dan Jasa	Fasilitatif	154	\N	t	2026-09-29 02:41:22.535	2026-09-29 02:41:22.535	t
167	LOG.00	Pergudangan	Fasilitatif	166	\N	t	2026-09-29 02:52:54.191	2026-09-29 02:52:54.191	t
170	LOG.01	Pengelolaan Aset	Fasilitatif	166	\N	t	2026-09-29 02:54:37.623	2026-09-29 02:54:37.623	t
175	MNJ.00	Administrasi Saham	Fasilitatif	174	Dokumen/Rekaman Kegiatan yang berkaitan dengan administrasi saham meliputi antara lain: daftar\r\npemegang saham dan daftar saham.	t	2026-09-29 02:57:35.503	2026-09-29 02:58:02.477	t
178	MNJ.01	Penyelenggara Rapat Perusahaan	Fasilitatif	174	\N	t	2026-09-29 02:59:13.115	2026-09-29 02:59:13.115	t
185	MNJ.02	Kearsipan	Fasilitatif	174	\N	t	2026-09-29 03:04:02.937	2026-09-29 03:04:02.937	t
246	SDM.06	Administrasi Direksi/ Dewan Komisaris/ Karyawan	Fasilitatif	223	\N	t	2026-09-29 03:43:37.694	2026-09-29 03:43:37.694	t
192	MNJ.03	Kepustsakaan / Library	Fasilitatif	174	\N	t	2026-09-29 03:06:44.419	2026-09-29 03:06:44.419	t
199	MUM.01	Pelayanan Akomodasi (Wisma Tamu dan Ruang Rapat)	Fasilitatif	195	\N	t	2026-09-29 03:15:03.305	2026-09-29 03:15:03.305	t
203	MUM.02	lnstalasi dan Jaringan	Fasilitatif	195	\N	t	2026-09-29 03:16:47.469	2026-09-29 03:16:47.469	t
208	MUM.03	Kendaraan Dinas	Fasilitatif	195	\N	t	2026-09-29 03:18:40.026	2026-09-29 03:18:40.026	t
218	MUM.05	Penggandaan	Fasilitatif	195	Dokumen/Rekaman Kegiatan yang berkaitan dengan penggandaan, meliputi pengelola foto copy\r\nyaitu perawatan/pemeliharaan, dan perbaikan kerusakan.	t	2026-09-29 03:22:20.374	2026-09-29 03:22:20.374	t
220	MUM.06	Pemeliharaan Lingkungan dan Kebersihan	Fasilitatif	195	\N	t	2026-09-29 03:23:18.985	2026-09-29 03:23:18.985	t
224	SDM.00	Perencanaan SDM / Manpower Planning	Fasilitatif	223	Dokumen/Rekaman Kegiatan yang berkaitan dengan Perencanaan SDM/ManPower Planning,\r\ndengan data pendukung meliputi: usulan dari Unit kerja, persetujuan, dan penetapan kebutuhan\r\ntenaga kerja.	t	2026-09-29 03:24:54.7	2026-09-29 03:24:54.7	t
227	SDM.01	Pengadaan SDM	Fasilitatif	223	\N	t	2026-09-29 03:27:00.551	2026-09-29 03:27:00.551	t
232	SDM.02	Mutasi Karyawan	Fasilitatif	223	\N	t	2026-09-29 03:30:50.184	2026-09-29 03:35:00.995	t
238	SDM.03	Komite Appraisal	Fasilitatif	223	\N	t	2026-09-29 03:37:06.066	2026-09-29 03:37:06.066	t
240	SDM.04	Assessment	Fasilitatif	223	\N	t	2026-09-29 03:41:02.575	2026-09-29 03:41:02.575	t
243	SDM.05	Disiplin Karyawan	Fasilitatif	223	\N	t	2026-09-29 03:42:12.487	2026-09-29 03:42:12.487	t
252	SDM.07	Pengembangan SDM	Fasilitatif	223	\N	t	2026-09-29 04:02:49.125	2026-09-29 04:02:49.125	t
255	SDM.08	Penghargaan Karyawan	Fasilitatif	223	\N	t	2026-09-29 04:03:50.103	2026-09-29 04:03:50.103	t
260	SDM.09	Kesejahteraan dan Fasilitas Karyawan	Fasilitatif	223	\N	t	2026-09-29 04:05:37.945	2026-09-29 04:05:37.945	t
267	SDM.10	Pembinaan Karyawan	Fasilitatif	223	\N	t	2026-09-29 04:09:44.775	2026-09-29 04:09:44.775	t
272	SDM.11	Dana Pensiun	Fasilitatif	223	Dokumen/Rekaman Kegiatan yang berkaitan dengan pengelolaan dana pensiun, meliputi:\r\npengangkatan pengurus, pengangkatan Dewan Pengawas, Peraturan Dana Pensiun (PDP), dan\r\narahan investasi.	t	2026-09-29 04:12:58.941	2026-09-29 04:12:58.941	t
274	SDM.12	Organisasi Non Kedinasan	Fasilitatif	223	\N	t	2026-09-29 04:13:33.145	2026-09-29 04:13:33.145	t
281	SDM.13	Pemutusan Hubungan Kerja	Fasilitatif	223	\N	t	2026-09-29 04:16:36.17	2026-09-29 04:16:36.17	t
284	SDM.14	Penyelesaian Bidang Ketenagakerjaan/Sengketa Karyawan	Fasilitatif	223	\N	t	2026-09-29 04:17:55.104	2026-09-29 04:18:12.971	t
286	SDM.15	Personal file	Fasilitatif	223	\N	t	2026-09-29 04:19:32.533	2026-09-29 04:19:32.533	t
289	DLT.00	Perencanaan Diklat	Fasilitatif	288	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Perencanaan Diklat,meliputi: Training\r\nNeed Analysis; Program Diklat Tahunan; Kurikulum/Silabus Diklat; dan Bahan Ajar Diklat	t	2026-09-29 04:43:25.217	2026-09-29 04:43:25.217	t
294	DLT.01	Pelaksanaan Diklat	Fasilitatif	288	\N	t	2026-09-29 04:45:30.215	2026-09-29 04:45:30.215	t
297	DLT.02	Evaluasi Diklat	Fasilitatif	288	\N	t	2026-09-29 04:46:23.7	2026-09-29 04:46:23.7	t
299	DLT.03	Database/Sistem lnformasi Diklat	Fasilitatif	288	\N	t	2026-09-29 04:47:03.896	2026-09-29 04:47:03.896	t
304	STI.01	Operasional Aplikasi	Fasilitatif	301	\N	t	2026-09-29 04:49:20.071	2026-09-29 06:24:01.222	t
302	STI.00	Master Plan Sistem lnformasi	Fasilitatif	301	\N	t	2026-09-29 04:48:15.959	2026-09-29 06:23:47.556	t
309	STI.04	Pengelolaan Data Server	Fasilitatif	301	\N	t	2026-09-29 04:51:37.461	2026-09-29 06:24:58.812	t
307	STI.03	PelayananTeknologi lnformasi	Fasilitatif	301	\N	t	2026-09-29 04:50:35.998	2026-09-29 06:27:45.271	t
312	STI.02	Pengelolaan lnfrastruktur	Fasilitatif	301	\N	t	2026-09-29 06:21:16.191	2026-09-29 06:29:16.822	t
320	SPI.00	Rencana Pengawasan	Fasilitatif	319	\N	t	2026-09-29 06:35:27.632	2026-09-29 06:36:27.794	t
323	SPI.01	Pengawasan Internal	Fasilitatif	319	\N	t	2026-09-29 06:37:43.207	2026-09-29 06:37:43.207	t
328	SPI.02	Pengawasan Eksternal	Fasilitatif	319	\N	t	2026-09-29 06:46:51.126	2026-09-29 06:46:51.126	t
333	SPI.03	Monitoring dan Evaluasi Pengawasan	Fasilitatif	319	\N	t	2026-09-29 06:48:51.552	2026-09-29 06:48:51.552	t
336	SPI.04	Laporan Tindakan Koreksi dan Pencegahan (LTKP)	Fasilitatif	319	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Tindakan Koreksi dan Pencegahan\r\n(LTKP)	t	2026-09-29 06:50:15.887	2026-09-29 06:50:15.887	t
338	SPI.05	Program Penanganan Benturan Kepentingan	Fasilitatif	319	\N	t	2026-09-29 06:51:32.351	2026-09-29 06:51:32.351	f
351	KBL.00	Program Kemitraan	Fasilitatif	350	\N	t	2026-09-29 06:57:47.233	2026-09-29 06:57:47.233	t
356	KBL.01	Bina Lingkungan	Fasilitatif	350	\N	t	2026-09-29 07:03:34.19	2026-09-29 07:03:34.19	t
366	KLH.00	Kesehatan Kerja	Fasilitatif	365	\N	t	2026-09-29 07:07:12.497	2026-09-29 07:07:12.497	t
370	KLH.01	Keselamatan Kerja	Fasilitatif	365	\N	t	2026-09-29 07:08:37.39	2026-09-29 07:08:37.39	t
373	KLH.02	Pemeriksaan dan Pengawasan Lingkungan kerja	Fasilitatif	365	\N	t	2026-09-29 07:09:33.555	2026-09-29 07:09:33.555	t
379	KLH.03	Pengamanan dan Ketertiban	Fasilitatif	365	\N	t	2026-09-29 07:12:01.094	2026-09-29 07:12:01.094	t
385	KLH.04	Pencegahan	Fasilitatif	365	\N	t	2026-09-29 07:15:05.72	2026-09-29 07:15:05.72	t
391	KLH.05	Penanggulangan	Fasilitatif	365	\N	t	2026-09-29 07:18:22.916	2026-09-29 07:18:22.916	t
396	KLH.06	Panitia Pembina Keselamatan & Kesehatan Kerja (P2K3)	Fasilitatif	365	\N	t	2026-09-29 07:21:43.159	2026-09-29 07:21:43.159	t
398	KLH.07	SafetyManagement	Fasilitatif	365	\N	t	2026-09-29 07:22:20.548	2026-09-29 07:22:20.548	t
400	KLH.08	Contractor Safety Management System (CSMS)	Fasilitatif	365	\N	t	2026-09-29 07:23:15.401	2026-09-29 07:23:15.401	t
402	KLH.09	Gugus Pengendali Kebakaran (Gupenkar)	Fasilitatif	365	\N	t	2026-09-29 07:23:57.051	2026-09-29 07:23:57.051	t
404	KLH.10	Safety Representative	Fasilitatif	365	Dokumen/Rekaman Kegiatan yang berkaitan dengan Safety Representative.	t	2026-09-29 07:24:47.111	2026-09-29 07:24:47.111	t
406	KLH.11	Sistem Manajemen Kesehatan dan Keselamatan	Fasilitatif	365	\N	t	2026-09-29 07:25:27.018	2026-09-29 07:25:27.018	t
49	ORG.01.03	Sertifikasi Perusahaan	Fasilitatif	46	Dokumen/Rekaman Kegiatan yang berkaitan dengan Sertifikasi Perusahaan yang\r\nmeliputi: Sertifikasi Kelaikan lnstalasi, Sertifikasi Produk, Sertifikasi Sistem\r\nManajemen Mutu, Sertifikasi Sistem Manajemen Lingkungan, Sertifikasi Sistem\r\nKesehatan Kerja, Sertifikasi Keamanan, dengan data pendukung korespondensi,\r\njadwal, rapat pembukaan dan rapat penutupan, temuan, laporan tindak lanjut hasil\r\ntemuan, tinjauan manajemen, dan sertifikat	t	2026-09-29 01:23:56.088	2026-09-29 01:23:56.088	f
101	STH.03.01	Media Cetak	Fasilitatif	100	Dokumen/Rekaman Kegiatan yang berkaitan dengan Publikasi dengan Media\r\nCetak yang meliputi majalah, jurnal, Newsletter, pencetakan kalender dan\r\npencetakan buku agenda.	t	2026-09-29 01:59:07.384	2026-09-29 01:59:07.384	f
30	REN.00.01	Rencana Kerja Jangka Panjang (RJP)	Fasilitatif	29	Dokumen/Rekaman Kegiatan yang berkaitan dengan Rencana Kerja Jangka\r\nPanjang meliputi: Rencana Usaha Penyediaan Tenaga Listrik (RUPTL) dan\r\nRencana Umum Ketenagalistrikan Nasional (RUKN), mulai dari usulan rencana\r\nkerja dari Unit kerja, penyusunan draft awal sampai dengan finalisasi.	t	2026-09-08 04:45:35.315	2026-09-08 07:22:54.317	f
31	REN.00.02	Rencana Jangka Menengah (RJM)	Fasilitatif	29	Dokumen/Rekaman Kegiatan yang berkaitan dengan Rencana Jangka Menengah\r\n(RJM), mulai dari usulan dari Unit kerja, penyusunan draft awal sampai dengan\r\nfinalisasi.	t	2026-09-14 07:17:35.042	2026-09-14 07:17:35.042	f
32	REN.00.03	Rencana Kerja Tahunan Perusahaan	Fasilitatif	29	Dokumen/Rekaman Kegiatan yang berkaitan dengan Rencana Kerja Tahunan\r\nPerusahaan, mulai dari usulan dari Unit kerja, penyusunan draft awal sampai\r\ndengan finalisasi.	t	2026-09-14 07:17:56.53	2026-09-14 07:17:56.53	f
33	REN.00.04	Rencana Kerja Anak Perusahaan	Fasilitatif	29	Dokumen/Rekaman Kegiatan yang berkaitan dengan Rencana Kerja Anak\r\nPerusahaan, mulai dari usulan dari Unit kerja, penyusunan draft awal sampai\r\ndengan finalisasi.	t	2026-09-14 07:18:18.128	2026-09-14 07:18:18.128	f
50	ORG.01.04	Key Performance Indicator (KPI)	Fasilitatif	46	Dokumen/Rekaman Kegiatan yang berkaitan dengan Key Performance Indicator\r\n(KPI) yang meliputi:manajemen perusahaan, hard competency individu, dan soft\r\ncompetency individu, dengan data pendukung: kontrak manajemen, realisasi, dan\r\ntarget.	t	2026-09-29 01:24:48.961	2026-09-29 01:24:48.961	f
51	ORG.01.05	Analisis Beban Kerja (ABK)	Fasilitatif	46	Dokumen/Rekaman Kegiatan yang berkaitan dengan Analisis Beban Kerja (ABK)\r\nmulai dari: proses penyusunan, laporan hasil ABK, dan sosialisasi ABK	t	2026-09-29 01:25:44.267	2026-09-29 01:25:44.267	f
52	ORG.01.06	Job Description	Fasilitatif	46	Dokumen/Rekaman Kegiatan yang berkaitan dengan Job Description dengan data\r\npendukung meliputi: Surat usulan pembuatan Job Description ke Unit kerja, Surat\r\nbalasan usulan pembuatan Job Description, Job Scoring,dan hasil Job Description.	t	2026-09-29 01:26:13.821	2026-09-29 01:26:13.821	f
53	ORG.01.07	lnovasi Perusahaan I Gugus Kendali Mutu (GKM)	Fasilitatif	46	Dokumen/Rekaman Kegiatan yang berkaitan dengan lnovasi Perusahaan I\r\nGugus Kendali Mutu (GKM)	t	2026-09-29 01:26:40.819	2026-09-29 01:26:40.819	f
35	REN.01.01	Laporan Berkala	Fasilitatif	34	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Berkala Perusahaan\r\nyang meliputi: Laporan Bulanan; Laporan Triwulan; dan Laporan Semesteran,\r\nmulai dari penyusunan draft awal sampai dengan final draft.	t	2026-09-14 07:20:07.079	2026-09-14 07:20:07.079	f
36	REN.01.02	Laporan Khusus/lnsidental	Fasilitatif	34	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan\r\nKhusus/lnsidental Perusahaan mulai dari pengumpulan bahan laporan,\r\npenyusunan draft awal sampai dengan finalisasi draft	t	2026-09-14 07:20:28.496	2026-09-14 07:20:28.496	f
37	REN.01.03	Laporan Manajemen	Fasilitatif	34	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Manajemen\r\nPerusahaan yang meliputi antara lain monitoring kinerja bulanan perusahaan,\r\nnotulen, mulai dari proses pengumpulan bahan laporan, penyusunan draft awal\r\nsampai dengan finalisasi draft.	t	2026-09-14 07:20:51.59	2026-09-14 07:20:51.59	f
38	REN.01.04	Laporan Tahunan Perusahaan (Annual Report)	Fasilitatif	34	Dokumen/Rekaman Kegiatan yang berkaitan dengan laporan Tahunan\r\nPerusahaan (Annual Report) Perusahaan mulai dari pengumpulan bahan\r\nlaporan, penyusunan draft awal sampai dengan finalisasi draft.	t	2026-09-14 07:21:21.99	2026-09-14 07:21:39.212	f
39	REN.01.05	Laporan Statistik	Fasilitatif	34	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Statistik\r\nPerusahaan mulai dari pengumpulan bahan laporan, penyusunan draft awal\r\nsampai dengan finalisasi draft.	t	2026-09-14 07:22:15.006	2026-09-14 07:22:15.006	f
40	REN.01.06	Laporan Anak Perusahaan	Fasilitatif	34	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Anak Perusahaan\r\nmulai dari pengumpulan bahan laporan, penyusunan draft awal sampai dengan\r\nfinalisasi draft.	t	2026-09-14 07:22:54.687	2026-09-14 07:22:54.687	f
43	ORG.00.01	Pendirian Perusahaan	Fasilitatif	42	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pendirian Perusahaan\r\nyang meliputi: Akta Pendirian Perusahaan dan Anggaran Dasar dan\r\nAnggaran Rumah Tangga Perusahaan	t	2026-09-29 01:19:25.134	2026-09-29 01:19:25.134	f
44	ORG.00.02	Struktur Organisasi	Fasilitatif	42	Dokumen/Rekaman Kegiatan yang berkaitan dengan Struktur Organisasi yang\r\nmeliputi: Pembentukan organisasi; perubahan organisasi, pengembangan\r\norganisasi, evaluasi organisasi, dan pembubaran organisasi.	t	2026-09-29 01:19:57.282	2026-09-29 01:19:57.282	f
45	ORG.00.03	ldentitas Perusahaan	Fasilitatif	42	Dokumen/Rekaman Kegiatan yang berkaitan dengan ldentitas Perusahaan yang\r\nmeliputi: sejarah berdirinya perusahaan, company profile, visi dan misi\r\nperusahaan, tata nilai perusahaan, dan logo perusahaan	t	2026-09-29 01:20:44.181	2026-09-29 01:20:44.181	f
47	ORG.01.01	Standar Operasional Prosedur Perusahaan	Fasilitatif	46	Dokumen/Rekaman Kegiatan yang berkaitan dengan Standart Operational\r\nProsedur (SOP) Perusahaan yang meliputi: penyusunan prosedur, revisi\r\nprosedur, perubahan dokumen, dan dokumen final prosedur.	t	2026-09-29 01:21:49.561	2026-09-29 01:21:49.561	f
48	ORG.01.02	Kriteria Penilaian Kinerja Unggul (KPKU)	Fasilitatif	46	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kriteria Penilaian Kinerja\r\nUnggul (KPKU) yang meliputi: aplikasiIpeta ADLI, OFI dan tindak lanjutnya,\r\ntinjauan manajemen, dan surveilance.	t	2026-09-29 01:22:20.357	2026-09-29 01:22:20.357	f
56	HKM.00.01	Peraturan Direksi	Fasilitatif	55	Dokumen/Rekaman Kegiatan yang berkaitan dengan penyusunan Peraturan\r\nDireksi mulai dari penyusunan draft awal, pembahasan, final draft sampai dengan\r\npengesahan.	t	2026-09-29 01:28:19.312	2026-09-29 01:28:19.312	f
57	HKM.00.02	Edaran Direksi	Fasilitatif	55	Dokumen/Rekaman Kegiatan yang berkaitan dengan penyusunan Peraturan\r\nPelaksana di lingkungan PLN, mulai dari penyusunan draft awal, pembahasan,\r\nfinal draft sampai dengan pengesahan.	t	2026-09-29 01:28:38.503	2026-09-29 01:28:38.503	f
58	HKM.00.03	Manual Produk	Fasilitatif	55	Dokumen/Rekaman Kegiatan yang berkaitan dengan penyusunan manual produk\r\ndi lingkungan PLN, mulai dari penyusunan draft awal, pembahasan, final draft\r\nsampai dengan pengesahan.	t	2026-09-29 01:28:56.132	2026-09-29 01:28:56.132	f
59	HKM.00.04	Petunjuk Teknis	Fasilitatif	55	Dokumen/Rekaman Kegiatan yang berkaitan dengan penyusunan Petunjuk\r\nTeknis mulai dari penyusunan draft awal, pembahasan, final draft sampai dengan\r\npengesahan.	t	2026-09-29 01:29:14.258	2026-09-29 01:29:14.258	f
60	HKM.00.05	Memorandum Prosedur	Fasilitatif	55	Dokumen/Rekaman Kegiatan yang berkaitan dengan penyusunan Memorandum\r\nProsedur mulai dari penyusunan draft awal, pembahasan, final draft sampai\r\ndengan pengesahan.	t	2026-09-29 01:30:11.481	2026-09-29 01:30:11.481	f
61	HKM.00.06	Keputusan	Fasilitatif	55	Dokumen/Rekaman Kegiatan yang berkaitan dengan penyusunan Keputusan\r\nmulai dari penyusunan draft awal, pembahasan, final draft sampai dengan\r\npengesahan.	t	2026-09-29 01:31:24.025	2026-09-29 01:31:24.025	f
63	HKM.01.01	Keputusan Pemegang Saham	Fasilitatif	62	Dokumen/Rekaman Kegiatan yang berkaitan dengan penyusunan Keputusan\r\nPemegang Saham mulai dari proses penyusunan draft awal, pembahasan,\r\npenyusunan draft akhir, sampai dengan pengesahan Direksi	t	2026-09-29 01:34:19.25	2026-09-29 01:34:19.25	f
64	HKM.01.02	Akta-Akta Perusahaan I Notariat	Fasilitatif	62	Dokumen/Rekaman Kegiatan yang berkaitan dengan Akta-Akta\r\nPerusahaanINotariat yang meliputi: Akta Pemegang Saham; Akta Perubahan\r\nPemegang Saham; Akta Pengangkatan/Pemberhentian Direksi; Akta\r\nPengangkatan/ Pemberhentian Dewan Komisaris; dan Akta Perubahan Modal\r\nPerusahaan	t	2026-09-29 01:34:39.144	2026-09-29 01:34:39.144	f
66	HKM.02.01	Perjanjian Kerjasama/MoU Dalam Negeri	Fasilitatif	65	Dokumen/Rekaman Kegiatan yang berkaitan dengan Perjanjian Kerjasama/MoU\r\nDalam Negeri, seperti: Joint Venture, dan Perguruan Tinggi, mulai dari\r\npenyusunan draft, pembahasan, final draft sampai dengan pengesahan/proses\r\npenandatanganan.	t	2026-09-29 01:35:25.844	2026-09-29 01:35:25.844	f
67	HKM.02.02	Perjanjian Kerjasama/Mou Luar Negeri	Fasilitatif	65	Dokumen/Rekaman Kegiatan yang berkaitan dengan Perjanjian Kerjasama /MoU\r\nLuar Negeri, mulai dari penyusunan draft, pembahasan, final draft sampai dengan\r\npengesahan/proses penandatanganan.	t	2026-09-29 01:35:51.504	2026-09-29 01:35:51.504	f
69	HKM.03.01	Sosialisasi Hukum	Fasilitatif	68	Dokumen/Rekaman Kegiatan yang berkaitan dengan Sosialisasi Hukum, dengan\r\ndata pendukung: dokumen administrasi, materi sosialisasi, sampai dengan\r\npenyusunan laporan kegiatan sosialisasi.	t	2026-09-29 01:37:02.084	2026-09-29 01:37:21.473	f
71	HKM.04.01	Litigasi	Fasilitatif	70	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kasus I Sengketa Hukum\r\nLitigasi yang meliputi: pidana, perdata, dan PTUN.	t	2026-09-29 01:38:10.575	2026-09-29 01:38:10.575	f
72	HKM.04.02	Non Litigasi	Fasilitatif	70	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kasus I Sengketa Hukum\r\nNon Litigasi yang meliputi: Perburuhan, Arbitrasi, dan Sengketa Adat.	t	2026-09-29 01:38:31.478	2026-09-29 01:38:31.478	f
74	HKM.05.01	Bantuan Hukum	Fasilitatif	73	Dokumen/Rekaman Kegiatan yang berkaitan dengan Bantuan Hukum baik hukum\r\nperdata maupun hukum pidana, mulai dari Surat permohonan bantuan, proses\r\nbantuan hukum sampai dengan putusan hukum	t	2026-09-29 01:39:37.911	2026-09-29 01:39:37.911	f
75	HKM.05.02	Konsultasi Hukum	Fasilitatif	73	Dokumen/Rekaman Kegiatan yang berkaitan dengan Konsultasi Hukum yang\r\nmeliputi: permintaan/pengadaan konsultan dan Surat menyurat terkait dengan\r\npermohonan konsultasi hukum.	t	2026-09-29 01:39:58.732	2026-09-29 01:39:58.732	f
76	HKM.05.03	Kajian Hukum/Legal Review/Legal Opinion	Fasilitatif	73	Dokumen/Rekaman Kegiatan yang berkaitan dengan Legal Review, Legal Opinion.	t	2026-09-29 01:40:49.737	2026-09-29 01:40:49.737	f
78	HKM.06.01	Dokumentasi Perundangan-undangan	Fasilitatif	77	Dokumen/Rekaman Kegiatan yang berkaitan dengan DokumentasiPerundanganundangan,\r\nmeliputi: Undang-Undang, Peraturan Pemerintah, Peraturan Menteri,\r\nSurat Keputusan Menteri, Surat Edaran Menteri, Peraturan Daerah, dan lain-lain.	t	2026-09-29 01:41:34.361	2026-09-29 01:41:34.361	f
80	HKM.07.01	Perizinan Operasional Perusahaan	Fasilitatif	79	Dokumen/Rekaman Kegiatan yang berkaitan dengan Perizinan Operasional\r\nPerusahaan, meliputi: Perizinan Operasional Pembangkitan; Perizinan\r\nOperasional Transmisi; lzin Radio Aktif; lzin Pengeboran; dengan data\r\npendukung:Dokumen Pendukung Proses Pengurusan dan Dokumen Perizinan.	t	2026-09-29 01:42:54.772	2026-09-29 01:42:54.772	f
81	HKM.07.02	Perizinan Pengembangan	Fasilitatif	79	Dokumen/Rekaman Kegiatan yang berkaitan dengan Perizinan Pengembangan,\r\nmeliputi: lzin Amdal dan Kebisingan; lzin Prinsip; lzin Reklame, dengan data\r\npendukung: Dokumen Pendukung Proses Pengurusan dan Dokumen Perizinan.	t	2026-09-29 01:43:27.739	2026-09-29 01:43:27.739	f
82	HKM.07.03	Perizinan Aset	Fasilitatif	79	Dokumen/Rekaman Kegiatan yang berkaitan dengan Perizinan Aset, meliputi:\r\nlzin Mendirikan Bangunan; Hak Guna Bangunan Tanah; Hak Pakai Tanah,\r\ndengan data pendukung: Dokumen Pendukung Proses Pengurusan dan\r\nDokumen Perizinan.	t	2026-09-29 01:43:50.385	2026-09-29 01:43:50.385	f
84	HKM.08.01	Hak Cipta	Fasilitatif	83	Dokumen/Rekaman Kegiatan yang berkaitan dengan proses penetapan Hak\r\nCipta, mulai dari proses pengajuan sampai dengan penetapan.	t	2026-09-29 01:44:40.658	2026-09-29 01:44:40.658	f
85	HKM.08.02	Hak Paten	Fasilitatif	83	Dokumen/Rekaman Kegiatan yang berkaitan dengan proses penetapan Hak Paten,\r\nbaik hak paten biasa maupun sederhana mulai dari proses pengajuan sampai dengan\r\npenetapan.	t	2026-09-29 01:45:23.586	2026-09-29 01:45:23.586	f
86	HKM.08.03	Permohonan HAKI Yang Ditolak	Fasilitatif	83	Dokumen/Rekaman Kegiatan yang berkaitan dengan permohonan HAKI yang ditolak	t	2026-09-29 01:45:52.641	2026-09-29 01:45:52.641	f
90	STH.00.02	Kunjungan/Studi Banding	Fasilitatif	88	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kunjungan/Studi Banding\r\nmeliputi: kunjungan/studi banding dari dalam negerimaupun dari luar negeri, mulai\r\ndari Surat permohonan sampai dengan laporan kegiatan kunjungan/studi banding.	t	2026-09-29 01:49:00.633	2026-09-29 01:54:11.601	f
89	STH.00.01	Penyelenggaraan Kegiatan Kedinasan	Fasilitatif	88	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penyelenggaraan Kegiatan\r\nKedinasan meliputi: Serah Terima Jabatan (Sertijab); Peresmian; HUT\r\nPerusahaan; Peringatan Hari Besar; Jamuan Makan; Penandatanganan MoU;\r\nUpacara Bendera, dan kegiatan kedinasan lainnya.	t	2026-09-29 01:48:34.86	2026-09-29 01:54:00.229	f
92	STH.01.01	Hubungan dengan Lembaga Pemerintah	Fasilitatif	91	Dokumen/Rekaman Kegiatan yang berkaitan dengan Hubungan dengan\r\nLembaga Pemerintah, mengenai kegiatan yang berkaitan dengan urusanurusan\r\nkedinasan.	t	2026-09-29 01:55:05.813	2026-09-29 01:55:05.813	f
93	STH.01.02	Hubungan dengan Perusahaan lainIAnak Perusahaan	Fasilitatif	91	Dokumen/Rekaman Kegiatan yang berkaitan dengan Hubungan dengan\r\nPerusahaan lain I Anak Perusahaan, mengenai kegiatan yang berkaitan dengan\r\nurusan-urusan kedinasan.	t	2026-09-29 01:55:32.358	2026-09-29 01:55:32.358	f
94	STH.01.03	Hubungan dengan Organisasi Sosial/LSM/Masyarakat/ Bakohumas	Fasilitatif	91	Dokumen/Rekaman Kegiatan yang berkaitan dengan Hubungan dengan Organisasi\r\nSosial/LSM/Masyarakat/Bakohumas mengenai kegiatan yang berkaitan dengan\r\nurusan- urusan kedinasan.	t	2026-09-29 01:55:51.786	2026-09-29 01:55:51.786	f
95	STH.01.04	Hubungan dengan Lembaga Pendidikan (Kerja Praktek/Magang/Praktek Kerja Lapangan)	Fasilitatif	91	Dokumen/Rekaman Kegiatan yang berkaitan dengan Hubungan dengan Lembaga\r\nPendidikan (Kerja Praktek/Magang/Praktek Kerja Lapangan), dengan data\r\npendukung antara lain: Surat permohonan magang/praktek kerja, Surat balasan dari\r\ninstansi (Confirmation Letters), proposal, dan lain-lain.	t	2026-09-29 01:56:29.886	2026-09-29 01:56:29.886	f
96	STH.01.05	Hubungan dengan Media Massa/ Media Relationship	Fasilitatif	91	Dokumen/Rekaman Kegiatan yang berkaitan dengan Hubungan dengan Media\r\nMassa/ Media Relationship, seperti: press release (media lokal dan media nasional);\r\nkunjungan wartawan/peliputan/wawancara.	t	2026-09-29 01:56:57.488	2026-09-29 01:56:57.488	f
98	STH.02.01	DPR / DPD RI	Fasilitatif	97	Dokumen/Rekaman Kegiatan yang berkaitan dengan Rapat Dengar Pendapat\r\ndengan DPR I DPD RI, dengan data pendukung antara lain: Surat pemberitahuan,\r\nbahan rapat, dll.	t	2026-09-29 01:57:56.279	2026-09-29 01:57:56.279	f
99	STH.02.02	DPRD	Fasilitatif	97	Dokumen/Rekaman Kegiatan yang berkaitan dengan Rapat Dengar Pendapat dengan\r\nDPRD, dengan data pendukung antara lain: Surat pemberitahuan, bahan rapat, dll.	t	2026-09-29 01:58:12.588	2026-09-29 01:58:12.588	f
102	STH.03.02	Media Elektronik I Media Sosial	Fasilitatif	100	Dokumen/Rekaman Kegiatan yang berkaitan dengan Media Elektronik I Media\r\nSosial	t	2026-09-29 01:59:26.689	2026-09-29 01:59:26.689	f
103	STH.03.03	Pengumpulan, Pengolahan dan Penyajian lnformasi Perusahaan/PPID	Fasilitatif	100	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengumpulan,\r\nPengolahan dan Penyajian lnformasi Perusahaan/PPID, seperti kliping koran,\r\nbrosur, leaflet, pamflet poster, plakat, pengumuman, dan pemberitaan.	t	2026-09-29 02:00:11.175	2026-09-29 02:00:11.175	f
104	STH.03.04	Company Profile	Fasilitatif	100	Dokumen/Rekaman Kegiatan yang berkaitan dengan Company Profile.	t	2026-09-29 02:00:34.421	2026-09-29 02:00:34.421	f
105	STH.03.05	Desain dan Cetak	Fasilitatif	100	Dokumen/Rekaman Kegiatan yang berkaitan dengan Desain dan Cetak, meliputi:\r\nback drop dan spanduk; iklan perusahaan (iklan produk, iklan bantuan, iklan CSR)	t	2026-09-29 02:00:53	2026-09-29 02:00:53	f
106	STH.00.03	Agenda Kegiatan Direksi	Fasilitatif	88	Dokumen/Rekaman Kegiatan yang berkaitan dengan Agenda Kegiatan Direksi,\r\nseperti: Rapat Direksi, rapat koordinasi, dan RUPS dengan Anak Perusahaan,\r\ndan lain-lain.	t	2026-09-29 02:02:30.149	2026-09-29 02:02:30.149	f
108	STH.04.01	Sponsorship	Fasilitatif	107	Dokumen/Rekaman Kegiatan yang berkaitan dengan Sponsorship, meliputi\r\nProposal yang dibantu dan proposal yang ditolak.	t	2026-09-29 02:03:54.12	2026-09-29 02:03:54.12	f
110	STH.05.01	Pameran Dalam Negeri	Fasilitatif	109	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Pameran\r\nDalam Negeri, mulai dari perencanaan, pelaksanaan, dan pelaporan kegiatan\r\npameran.	t	2026-09-29 02:04:40.487	2026-09-29 02:04:40.487	f
111	STH.05.02	Pameran Luar Negeri	Fasilitatif	109	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Pameran Luar\r\nNegeri, mulai dari perencanaan, pelaksanaan, dan pelaporan kegiatan\r\npameran.	t	2026-09-29 02:06:19.887	2026-09-29 02:06:19.887	f
113	STH.06.01	Dokumentasi/Liputan	Fasilitatif	112	Dokumen/Rekaman Kegiatan yang berkaitan dengan Dokumentasi/ Liputan melalui\r\nberbagai media kertas/foto/video/rekaman suara/multimedia, meliputi kegiatan dinas\r\npimpinan, Acara kedinasan pimpinan, peristiwa-peristiwa penting masing-masing\r\nbidang.	t	2026-09-29 02:07:18.711	2026-09-29 02:07:18.711	f
115	STH.07.01	Pelaporan/Keluhan Masyarakat	Fasilitatif	114	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pelaporan/Keluhan Masyarakat	t	2026-09-29 02:08:15.946	2026-09-29 02:08:15.946	f
116	STH.07.02	Penanganan Keluhan	Fasilitatif	114	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penanganan Keluhan\r\nmasyarakat	t	2026-09-29 02:08:41.204	2026-09-29 02:08:41.204	f
118	STH.08.01	Cenderamata	Fasilitatif	117	Dokumen/Rekaman Kegiatan yang berkaitan dengan penyiapan dan pemberian\r\ncinderamata kepada internal dan eksternal	t	2026-09-29 02:09:14.955	2026-09-29 02:09:14.955	f
120	STH.09.01	Ucapan terima kasih, ucapan selamat, belasungkawa dan permohonan maaf	Fasilitatif	119	Dokumen/Rekaman Kegiatan yang berkaitan dengan ucapan terima kasih, ucapan\r\nselamat, belasungkawa dan permohonan maaf.	t	2026-09-29 02:10:01.191	2026-09-29 02:10:01.191	f
123	KEU.00.01	Usulan RKAP	Fasilitatif	122	Dokumen/Rekaman Kegiatan yang berkaitan dengan Usulan RKAP meliputi usulan\r\nprogram kerja dan anggaran Unit.	t	2026-09-29 02:13:10.112	2026-09-29 02:13:10.112	f
124	KEU.00.02	Penyusunan RKAP	Fasilitatif	122	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penyusunan RKAP meliputi:\r\nCorporate Letter, parameter anggaran, pembahasan RKAP, pra RUPS RKAP,\r\npersetujuan anggaran, dan Surat persetujuan realisasi anggaran.	t	2026-09-29 02:13:30.025	2026-09-29 02:13:30.025	f
125	KEU.00.03	Realisasi dan Revisi Anggaran	Fasilitatif	122	Dokumen/Rekaman Kegiatan yang berkaitan dengan Realisasi dan RevisiAnggaran\r\nmeliputi antara lain Surat permintaan relokasi anggaran dan hasil revisi anggaran.	t	2026-09-29 02:13:47.091	2026-09-29 02:13:47.091	f
127	KEU.01.01	Pembayaran Internal	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan pembayaran internal, dengan\r\ndata pendukung meliputi: gaji Direksi/Komisaris dan karyawan, honor Komite, SPB\r\npembayaran lainnya, Surat peringatan uang muka, daftar pengembalian\r\npemotongan uang muka, bukti memoria, dan biaya perjalanan dinas.	t	2026-09-29 02:15:20.642	2026-09-29 02:15:20.642	f
128	KEU.01.02	Pembayaran Eksternal	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan pembayaran eksternal,\r\ndengan data pendukung antara lain: memo verifikasi pembayaran	t	2026-09-29 02:15:42.813	2026-09-29 02:15:42.813	f
129	KEU.01.03	Pengelolaan Asuransi	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan pengelolaan asuransi,\r\nantara lain: asuransi Pembangkit, Asuransi Gedung dan Bangunan, Asuransi\r\nKendaraan, dan Asuransi Ketenagakerjaan.	t	2026-09-29 02:16:02.934	2026-09-29 02:16:02.934	f
130	KEU.01.04	Rekonsiliasi Bank	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan rekonsiliasi bank,\r\nmeliputi: rekening koran, dan Berita Acara Rekonsiliasi Bank.	t	2026-09-29 02:16:26.64	2026-09-29 02:16:26.64	f
131	KEU.01.05	Letter of Credit	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan Letter of Credit, meliputi antara\r\nlain: memo pembukaan LC, copy PO, JOR, dan kontrak, aplikasi pembuatan\r\nLC/SKBDN, LC/SKBDN asli, dan lain-lain.	t	2026-09-29 02:16:47.823	2026-09-29 02:16:47.823	f
132	KEU.01.06	Perpajakan	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan perpajakan, meliputi:\r\nPajak Penambahan Nilai (PPN); Pajak Penghasilan (PPh):4 (2), 15, 22, 23,\r\n25, 26, 29, Sadan; Surat-Surat Perpajakan; SKPKB; KPLB; himbauan pajak;\r\ndan teguran.	t	2026-09-29 02:17:07.964	2026-09-29 02:17:07.964	f
133	KEU.01.07	Penagihan	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan penagihan, dengan data\r\npendukung: faktur pajak, invoice, kontrak/perjanjian jual beli, tanda terima, berita\r\nacara, dan dokumen DO.	t	2026-09-29 02:17:37.758	2026-09-29 02:17:37.758	f
134	KEU.01.08	Pendanaan	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan pendanaan , seperti penempatan dana.	t	2026-09-29 02:18:04.836	2026-09-29 02:18:04.836	f
135	KEU.01.09	Administrasi Pinjaman	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan pinjaman, meliputi:\r\nPinjaman Dalam Negeri, Pinjaman Luar Negeri.	t	2026-09-29 02:18:24.917	2026-09-29 02:18:24.917	f
136	KEU.01.10	Pinjaman Subholding/Anak Perusahaan	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan pinjaman kepada Subholding/Anak Perusahaan.	t	2026-09-29 02:19:04.822	2026-09-29 02:19:04.822	f
137	KEU.01.11	Institusi Keuangan dan Riset Pasar	Fasilitatif	126	Dokumen/Rekaman Kegiatan yang berkaitan dengan Institusi Keuangan dan Riset\r\nPasar.	t	2026-09-29 02:19:36.507	2026-09-29 02:19:36.507	f
139	KEU.02.01	Laporan lnduk Bulanan	Fasilitatif	138	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan lnduk Bulanan.	t	2026-09-29 02:20:12.555	2026-09-29 02:20:12.555	f
140	KEU.02.02	Laporan Konsolidasi Bulanan	Fasilitatif	138	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Konsolidasi Bulanan.	t	2026-09-29 02:21:04.48	2026-09-29 02:21:04.48	f
141	KEU.02.03	Laporan lnduk Tahunan	Fasilitatif	138	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan lnduk Tahunan (Audited).	t	2026-09-29 02:21:35.864	2026-09-29 02:21:35.864	f
142	KEU.02.04	Laporan Konsolidasi Tahunan	Fasilitatif	138	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Konsolidasi Tahunan (Audited).	t	2026-09-29 02:22:17.436	2026-09-29 02:22:17.436	f
143	KEU.02.05	Laporan Realisasi Anggaran	Fasilitatif	138	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Realisasi Anggaran, seperti prognosa keuangan.	t	2026-09-29 02:22:37.251	2026-09-29 02:22:37.251	f
144	KEU.02.06	Jurnal	Fasilitatif	138	Dokumen/Rekaman Kegiatan yang berkaitan dengan Jurnal, antara lain: jurnal koreksi dan jurnal pembebanan.	t	2026-09-29 02:23:04.901	2026-09-29 02:23:04.901	f
145	KEU.02.07	Laporan Kewajiban Pinjaman	Fasilitatif	138	Dokumen/Rekaman Kegiatan yang berkaitan dengan penyampaian Laporan Kewajiban Pinjaman kepada stakeholder internal dan eksternal.	t	2026-09-29 02:23:30.622	2026-09-29 02:23:30.622	f
147	KEU.03.01	Transaksi lnvestasi dan Aset	Fasilitatif	146	Dokumen/Rekaman Kegiatan yang berkaitan dengan Bukti Transaksi lnvestasi dan Aset, meliputi kuitansi, faktur pajak.	t	2026-09-29 02:24:45.52	2026-09-29 02:24:45.52	f
148	KEU.03.02	Transaksi Pertanggung Jawaban Kegiatan	Fasilitatif	146	Dokumen/Rekaman Kegiatan yang berkaitan dengan Bukti Transaksi\r\nPertanggungjawaban Kegiatan, meliputi kuitansi, faktur pajak.	t	2026-09-29 02:25:03.262	2026-09-29 02:25:03.262	f
149	KEU.03.03	Transaksi Penggantian/Reimburse	Fasilitatif	146	Dokumen/Rekaman Kegiatan yang berkaitan dengan Bukti Transaksi Reimburse\r\nmeliputi kuitansi, faktur pajak.	t	2026-09-29 02:25:28.463	2026-09-29 02:25:28.463	f
151	KEU.04.01	System Application and Product (SAP)	Fasilitatif	150	Dokumen/Rekaman Kegiatan yang berkaitan dengan System Application and Product (SAP).	t	2026-09-29 02:26:26.562	2026-09-29 02:26:26.562	f
152	KEU.04.02	Manual Aplikasi	Fasilitatif	150	Dokumen/Rekaman Kegiatan yang berkaitan dengan Manual Aplikasi.	t	2026-09-29 02:26:43.739	2026-09-29 02:26:43.739	f
153	KEU.04.03	Kebijakan Akuntansi	Fasilitatif	150	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kebijakan Akuntansi.	t	2026-09-29 02:27:06.568	2026-09-29 02:27:06.568	f
156	DAN.00.01	Kebutuhan Pengadaan	Fasilitatif	155	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kebutuhan Pengadaan,\r\nmeliputi: Analisa Kebutuhan Barang dan Jasa; Permintaan Pembelian Barang dan\r\nJasa, dengan data pendukung:WO/MR/RPPB/SPRR/ARPM, Purchase Requestion,\r\nPengajuan Anggaran, Konfirmasi Spesifikasi, dan Konfirmasi Pembelian.	t	2026-09-29 02:40:38.415	2026-09-29 02:40:38.415	f
157	DAN.00.02	Registrasi Rekanan	Fasilitatif	155	Dokumen/Rekaman Kegiatan yang berkaitan dengan Registrasi Rekanan, meliputi:\r\nevaluasi dokumen, persetujuan menjadi rekanan, daftar rekanan dalam bentuk\r\ndigital, dan evaluasi performance rekanan.	t	2026-09-29 02:40:57.714	2026-09-29 02:40:57.714	f
159	DAN.01.01	Pengadaan Barang	Fasilitatif	158	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengadaan Barang Habis\r\nPakai, mulai dari kegiatan Permintaan Pembelian, Harga Perhitungan Sendiri,\r\nPengajuan Anggaran, Usulan cara Pengadaan dan Daftar Rekanan, Surat\r\nPermintaan Penawaran Harga, Bid Bond, Surat Penawaran Harga, Performance\r\nBond, Berita Acara Pembukaan Surat Penawaran Harga, Evaluasi Penawaran Harga,\r\nBerita Acara Negosiasi Harga, Surat Permintaan Pembelian Barang (PO), Pengantar\r\nSPPB, dan dokumen pendukung lain.	t	2026-09-29 02:41:39.449	2026-09-29 02:41:39.449	f
160	DAN.01.02	Pengadaan Jasa	Fasilitatif	158	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengadaan Jasa	t	2026-09-29 02:42:23.748	2026-09-29 02:42:23.748	f
161	DAN.01.03	Pengadaan Barang dan Jasa	Fasilitatif	158	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengadaan Sarana dan\r\nPrasarana, meliputi: verifikasi dokumen legal milik rekanan, evaluasi kinerja\r\nrekanan pemasaran, dan lain-lain.	t	2026-09-29 02:43:22.3	2026-09-29 02:43:22.3	f
162	DAN.01.04	Pengadaan Jasa Pemeliharaan	Fasilitatif	158	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengadaan Jasa\r\nPemeliharaan, meliputi: Pengadaaan Jasa pemeliharaan Kebersihan dan\r\nPengadaaan Jasa Pemeliharaan gedung, dengan data pendukung antara lain:\r\nDokumen Order Kerja, service request, TOR, OE/HPS, PR dan Konfirmasi\r\nAnggaran, SPPH, Rencana Kerja dan Syarat, Berita Acara Aanwijzing, penunjukan\r\npenyedia jasa, Surat pengantar order kerja penyedia jasa, dan lain-lain.	t	2026-09-29 02:43:38.452	2026-09-29 02:43:38.452	f
163	DAN.01.05	Pengadaan Jasa Keamanan	Fasilitatif	158	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengadaan Jasa Keamanan,\r\nmeliputi: Pengadaaan Jasa Keamanan, dengan data pendukung antara lain:\r\nDokumen Order Kerja, service request, TOR, OE/HPS, PR dan Konfirmasi\r\nAnggaran, SPPH, Rencana Kerja dan Syarat, Berita Acara Aanwijzing, Surat\r\npengantar order kerja penyedia jasa, dan lain-lain.	t	2026-09-29 02:46:52.648	2026-09-29 02:46:52.648	f
164	DAN.01.06	Pengadaan Sarana dan Prasarana	Fasilitatif	158	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengadaan Sarana dan\r\nPrasarana, meliputi: verifikasi dokumen legal milik rekanan, evaluasi kinerja\r\nrekanan pemasaran, dan lain-lain.	t	2026-09-29 02:47:34.793	2026-09-29 02:47:34.793	f
165	DAN.01.07	Pengadaan Jasa Tenaga Alih Daya (Outsourcing)	Fasilitatif	158	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengadaan Jasa Tenaga Alih\r\nDaya (Outsourcing), dengan data pendukung meliputi: Surat permintaan dari Unit\r\nkerja, HPS, pengajuan anggaran, usulan cara pengadaan dan daftar rekanan,\r\nSurat permintaan penawaran harga, Bid Bond, Surat penawaran harga,\r\nperformance bond, berita acara pembukaan Surat penawaran harga, evaluasi\r\npenawaran harga, berita acara negosiasi harga, Surat permintaan pembelian\r\nbarang (PO), pengantar SPPB, dan dokumen pendukung lainnya.	t	2026-09-29 02:47:56.88	2026-09-29 02:48:04.197	f
168	LOG.00.01	Pemeriksaan dan Penerimaan Barang dan Jasa	Fasilitatif	167	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pemeriksaan dan Penerimaan\r\nBarang dan Jasa, meliputi: Pemeriksaan dan Penerimaan Barang (ATK, bahan\r\npenunjang); Pemeriksaan dan Penerimaan Jasa (Berita Acara Hasil Pemeriksaan\r\nPekerjaan, Berita Acara Pembayaran)	t	2026-09-29 02:53:40.44	2026-09-29 02:53:40.44	f
169	LOG.00.02	Pengelolaan Persediaan/ Stock	Fasilitatif	167	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengelolaan Persediaan/\r\nStock, meliputi: Registrasi Barang (ATK, bahan penunjang); Distribusi Material (ATK,\r\nbahan penunjang); Persediaan Material, Materi Adjustment, Stock Opname (ATK,\r\nbahan penunjang); Penghapusan Material.	t	2026-09-29 02:54:02.76	2026-09-29 02:54:02.76	f
171	LOG.01.01	Inventarisasi Aset	Fasilitatif	170	Dokumen/Rekaman Kegiatan yang berkaitan dengan lnventarisasi Aset, meliputi\r\nantara lain daftar inventarisasi aset.	t	2026-09-29 02:54:55.829	2026-09-29 02:54:55.829	f
172	LOG.01.02	Penggunaan Aset	Fasilitatif	170	Dokumen/Rekaman Kegiatan yang berkaitan dengan penggunaan aset, meliputi\r\nantara lain Berita Acara Penggunaan aset.	t	2026-09-29 02:55:49.262	2026-09-29 02:55:49.262	f
173	LOG.01.03	Penghapusan Aset	Fasilitatif	170	Dokumen/Rekaman Kegiatan yang berkaitan dengan penghapusan aset,\r\nmeliputi: usulan penghapusan barang, Pembentukan Tim Penghapusan Aset,\r\nBerita Acara Penghapusan Aset, dan daftar Aset yang dihapuskan.	t	2026-09-29 02:56:55.423	2026-09-29 02:56:55.423	f
176	MNJ.00.01	Daftar Pemegang Saham	Fasilitatif	175	Dokumen/Rekaman Kegiatan yang berkaitan dengan Daftar Pemegang Saham.	t	2026-09-29 02:58:33.42	2026-09-29 02:58:33.42	f
177	MNJ.00.02	Administrasi Saham	Fasilitatif	175	Dokumen/Rekaman Kegiatan yang berkaitan dengan Daftar Saham.	t	2026-09-29 02:58:53.545	2026-09-29 02:58:53.545	f
179	MNJ.01.01	Pra Rapat Umum Pemegang Saham (RUPS)	Fasilitatif	178	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pra Rapat Umum\r\nPemegang Saham (RUPS), dengan data pendukung antara lain: Surat\r\nUndangan Pra RUPS, Risalah Pra RUPS, Daftar Hadir Pra RUPS, materi\r\nrapat, dan lain-lain.	t	2026-09-29 03:01:16.747	2026-09-29 03:01:16.747	f
180	MNJ.01.02	Rapat Umum Pemegang Saham (RUPS)	Fasilitatif	178	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pra Rapat Umum\r\nPemegang Saham (RUPS), dengan data pendukung antara lain: Surat\r\nUndangan Pra RUPS, Risalah Pra RUPS, Daftar Hadir Pra RUPS, materi\r\nrapat, dan lain-lain.	t	2026-09-29 03:01:55.392	2026-09-29 03:02:12.4	f
181	MNJ.01.03	Pra Rapat Umum Pemegang Saham Luar Biasa (RUPSLB)	Fasilitatif	178	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pra Rapat Umum\r\nPemegang Saham Luar Biasa (RUPSLB) dengan data pendukung meliputi\r\nantara lain: surat undangan, presensi/daftar hadir, notulen rapat, skenario\r\nRUPSLB, dan Risalah RUPSLB/Keputusan Pemegang Saham.	t	2026-09-29 03:02:30.913	2026-09-29 03:02:30.913	f
182	MNJ.01.04	Rapat Pimpinan	Fasilitatif	178	Dokumen/Rekaman Kegiatan yang berkaitan dengan Rapat Pimpinan meliputi:\r\nRapat Direksi dan Dewan Komisaris, Rapat Dewan Komisaris, Rapat Dewan\r\nDireksi, Risalah Rapat Direksi, Keputusan Direksi di Luar Rapat Direksi\r\n(Sirkuler), Rapat General Manager (GM), dengan data pendukung antara lain:\r\nSurat undangan, presensi, notulen rapat, tindak laniut rapat.	t	2026-09-29 03:02:50.64	2026-09-29 03:02:50.64	f
183	MNJ.01.05	Rapat Gabungan/ Rapat Staf	Fasilitatif	178	Dokumen/Rekaman Kegiatan yang berkaitan dengan Rapat Gabungan/Rapat\r\nStaf meliputi: Rapat Monitoring Kinerja; Rapat Sosialisasi RKAP; Rapat Internal;\r\ndengan data pendukung meliputi antara lain: undangan, presensi, notulen rapat,\r\ntindak lanjut rapat.	t	2026-09-29 03:03:10.82	2026-09-29 03:03:10.82	f
184	MNJ.01.06	Rapat Koordinasi dengan Anak Perusahaan	Fasilitatif	178	Dokumen/Rekaman Kegiatan yang berkaitan dengan Rapat Koordinasi dengan\r\nAnak Perusahaan, dengan data pendukung meliputi antara lain: undangan,\r\npresensi, notulen rapat, tindak lanjut rapat, kesepakatan bersama/rekomendasi	t	2026-09-29 03:03:31.761	2026-09-29 03:03:31.761	f
186	MNJ.02.01	Penciptaan Arsip	Fasilitatif	185	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penciptaan Arsip meliputi\r\nPengelolaan Surat masuk (agenda Surat masuk (manual/elektronik), tanda\r\nterima Surat, disposisi, buku pendistribusian); Pengelolaan Surat keluar (buku\r\nagenda penomoran Surat keluar (manual/elektronik), daftar Surat pertinggal,\r\nnota dinas permintaan Unit kerja, buku pendistribusian).	t	2026-09-29 03:04:28.511	2026-09-29 03:04:28.511	f
187	MNJ.02.02	Pemeliharaan arsip	Fasilitatif	185	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pemeliharaan arsip meliputi\r\nPemberkasan (Daftar Arsip: Daftar Berkas dan Daftar lsi Berkas); Penataan Arsip\r\n(Daftar Arsip lnaktif); Penyimpanan (Skema Penataan Arsip, Peta Lokasi\r\nPenyimpanan Arsip, Checklist pengaturan suhu dan temperatur ruang\r\npenyimpanan; fumigasi); Alih Media (Berita Acara Alih Media Arsip, Daftar Arsip\r\nyang dialih mediakan); dan Akses Penggunaan Arsip (Suku peminjaman dan\r\nFormulir peminjaman).	t	2026-09-29 03:04:49.237	2026-09-29 03:04:49.237	f
188	MNJ.02.03	Pengelolaan Arsip Vital dan Arsip Terjaga	Fasilitatif	185	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengelolaan Arsip Vital dan\r\nArsip Terjaga, dengan data pendukung:Daftar Arsip Vital dan Daftar Arsip Terjaga,\r\ndan Berita Acara Penyerahan Salinan Arsip Terjaga.	t	2026-09-29 03:05:08.376	2026-09-29 03:05:08.376	f
189	MNJ.02.04	Penyusutan arsip	Fasilitatif	185	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penyusutan arsip, meliputi:\r\nPemindahan Arsip lnaktif (Berita Acara Pemindahan Arsip lnaktif, Daftar Arsip Yang\r\nDipindahkan); Pemusnahan Arsip (SK Tim Pemusnahan Arsip, Surat usulan\r\npemusnahan arsip, Rekomendasi/pertimbangan /persetujuan Pemusnahan dari\r\nKepala ANRI, Surat Keputusan Pemusnahan Arsip, Berita Acara Pemusnahan\r\nArsip, dan Daftar Arsip Musnah.); Penyerahan Arsip Statis (Surat Usulan\r\nPenyerahan Arsip Statis, Rekomendasi/Pertimbangan/Persetujuan Penyerahan\r\nArsip Statis, Berita Acara Penyerahan Arsip Statis, dan Daftar Arsip Usul Serah).	t	2026-09-29 03:05:28.01	2026-09-29 03:05:28.01	f
190	MNJ.02.05	Sistem Kearsipan (TND, Klasifikasi, JRA, KKAA)	Fasilitatif	185	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan penyusunan\r\nSistem Pengelolaan Arsip Dinamis, meliputi: Tata Naskah Dinas (TND), Klasifikasi\r\nArsip (KA), Jadwal Retensi Arsip (JRA), dan Klasifikasi Keamanan dan Akses\r\nArsip (KKAA); dan Sistem Tata Kearsipan Dinamis	t	2026-09-29 03:05:56.115	2026-09-29 03:05:56.115	f
191	MNJ.02.06	Pembinaan Kearsipan	Fasilitatif	185	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Pembinaan\r\nKearsipan, meliputi: Bimbingan Teknis Kersipan/Bimbingan Konsultasi Kearsipan\r\n(mulai dari: perencanaan, persiapan kegiatan, pelaksanaan kegiatan, sampai\r\ndengan pelaporan pelaksanaan kegiatan); Supervisi/ Pengawasan Kearsipan\r\n(mulai dari: perencanaan, persiapan kegiatan, pelaksanaan kegiatan, sampai\r\ndengan pelaporan hasil supervisi/pengawasan Kearsipan) ;Monitoring (mulai dari:\r\nperencanaan, persiapan kegiatan, pelaksanaan kegiatan, sampai dengan pelaporan\r\nhasil kegiatan monitoring).	t	2026-09-29 03:06:11.746	2026-09-29 03:06:11.746	f
193	MNJ.03.01	Pengembangan Bahan Pustaka	Fasilitatif	192	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengembangan Bahan\r\nPustaka, meliputi: Penyimpanan Deposit Bahan Pustaka; Pengembangan Koleksi\r\n(Akuisisi: pembelian, hibah, dan hadiah; Pengelolaan Bahan Pustaka, dan\r\nDatabase Katalog Koleksi).	t	2026-09-29 03:07:37.981	2026-09-29 03:07:37.981	f
194	MNJ.03.02	Jasa Perpustakaan dan lnformasi	Fasilitatif	192	Dokumen/Rekaman Kegiatan yang berkaitan dengan Jasa Perpustakaan dan\r\nlnformasi, meliputi: Keanggotaan (formulir pendaftaran, dan kartu anggota);\r\nSirkulasi (pemanfaatan koleksi perpustakaan oleh pemakai\r\nperpustakaan/peminjaman bahan pustaka); Referensi (pelayanan/penyajian\r\nkoleksi, pertanyaan-pertanyaan dan jawaban-jawaban dari pengguna/pengunjung\r\ndengan menggunakan referensi); dan database layanan perpustakaan.	t	2026-09-29 03:08:01.767	2026-09-29 03:08:01.767	f
210	MUM.03.02	Perbaikan Kendaraan Dinas	Fasilitatif	208	Dokumen/Rekaman Kegiatan yang berkaitan dengan Perbaikan Kendaraan\r\nDinas, dengan data pendukung antara lain permintaan dari Unit kerja, laporan\r\nkerusakan, dll.	t	2026-09-29 03:19:16.829	2026-09-29 03:19:16.829	f
197	MUM.00.01	Fasilitas Ruangan	Fasilitatif	196	Dokumen/Rekaman Kegiatan yang berkaitan dengan Fungsi Ruangan, meliputi:\r\nSurat Permohonan, Notulen Rapat Tim Tata Ruang, Rekomendasi Kelayakan\r\nFungsi Ruangan.	t	2026-09-29 03:14:16.257	2026-09-29 03:14:16.257	f
198	MUM.00.02	Standar Fasilitas	Fasilitatif	196	Dokumen/Rekaman Kegiatan yang berkaitan dengan Standar Fasilitas, meliputi:\r\nStandar Fasilitas Ruangan.	t	2026-09-29 03:14:40.35	2026-09-29 03:14:40.35	f
200	MUM.01.01	Penggunaan ruangan	Fasilitatif	199	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penggunaan fasilitas\r\nruangan untuk berbagai kegiatan, dengan data pendukung antara lain surat\r\npermohonan penggunaan fasilitas ruangan	t	2026-09-29 03:15:24.857	2026-09-29 03:15:24.857	f
201	MUM.01.02	Sarana dan Prasarana	Fasilitatif	199	Dokumen/Rekaman Kegiatan yang berkaitan dengan Sarana dan Prasarana\r\nWisma Tamu dan Ruang Rapat untuk berbagai kegiatan, dengan data\r\npendukung antara lain surat permohonan penggunaan sarana dan prasarana\r\nWisma Tamu dan Ruang Rapat	t	2026-09-29 03:16:08.67	2026-09-29 03:16:08.67	f
202	MUM.01.03	Konsumsi/Jamuan	Fasilitatif	199	Dokumen/Rekaman Kegiatan yang berkaitan dengan konsumsi/jamuan dengan\r\ndata pendukung antara lain surat permohonan konsumsi/jamuan, dan lain-lain.	t	2026-09-29 03:16:24.135	2026-09-29 03:16:24.135	f
204	MUM.02.01	Listrik	Fasilitatif	203	Dokumen/Rekaman Kegiatan yang berkaitan dengan pemasangan dan\r\npemeliharaan instalasi dan jaringan listrik, dengan data pendukung antara lain:\r\nsertifikasi instalasi, bukti tambah daya, rekening listrik, dll.	t	2026-09-29 03:17:06.353	2026-09-29 03:17:06.353	f
205	MUM.02.02	Air	Fasilitatif	203	Dokumen/Rekaman Kegiatan yang berkaitan dengan pemasangan dan\r\npemeliharaan lnstalasi air, dengan data pendukung antara lain: sertifikasi\r\ninstalasi, bukti pemasangan, permintaan pemasangan, rekening air, dll	t	2026-09-29 03:17:32.473	2026-09-29 03:17:32.473	f
206	MUM.02.03	Telepon	Fasilitatif	203	Dokumen/Rekaman Kegiatan yang berkaitan dengan pemasangan dan\r\npemeliharaan lnstalasi dan Jaringan telepon, dengan data pendukung antara\r\nlain: bukti pemasangan instalasi dan jaringan, permintaan pemasangan instalasi\r\ndan jaringan telepon, rekening telepon, dll	t	2026-09-29 03:17:53.436	2026-09-29 03:17:53.436	f
207	MUM.02.04	Internet	Fasilitatif	203	Dokumen/Rekaman Kegiatan yang berkaitan dengan berkaitan dengan\r\npemasangan dan pemeliharaan lnstalasi dan Jaringan Internet, dengan data\r\npendukung antara lain: bukti pemasangan instalasi dan jaringan, permintaan\r\npemasangan instalasi dan jaringan internet, rekening internet, dll	t	2026-09-29 03:18:18.527	2026-09-29 03:18:18.527	f
209	MUM.03.01	Penggunaan Kendaraan Dinas	Fasilitatif	208	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penggunaan Kendaraan\r\nDinas, dengan data pendukung permintaan dari Unit kerja, dan laporan\r\npenggunaan kendaraan dinas	t	2026-09-29 03:19:02.043	2026-09-29 03:19:02.043	f
211	MUM.03.03	Pajak Kendaraan Dinas	Fasilitatif	208	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pajak Kendaraan Dinas,\r\ndengan data pendukung permintaan dari Unit kerja, voucher PUM, copy STNK,\r\ndan Nota Pajak	t	2026-09-29 03:19:43.038	2026-09-29 03:19:43.038	f
212	MUM.03.04	Sewa Kendaraan	Fasilitatif	208	Dokumen/Rekaman Kegiatan yang berkaitan dengan Sewa Kendaraan, dengan\r\ndata pendukung antara lain:Surat Perjanjian Sewa.	t	2026-09-29 03:20:03.326	2026-09-29 03:20:03.326	f
213	MUM.03.05	Pengadaan Bahan Bakar	Fasilitatif	208	Dokumen/Rekaman Kegiatan yang berkaitan dengan pengadaan bahan bakar,\r\ndengan data pendukung antara lain: voucher, dan lain-lain.	t	2026-09-29 03:20:21.804	2026-09-29 03:20:21.804	f
215	MUM.04.01	Penempatan Rumah Dinas	Fasilitatif	214	Dokumen/Rekaman Kegiatan yang berkaitan dengan penempatan rumah dinas,\r\ndengan data pendukung antara lain Berita Acara Surat Perjanjian Menempati\r\nRumah Dinas, dan lain-lain.	t	2026-09-29 03:21:17.123	2026-09-29 03:21:17.123	f
216	MUM.04.02	Fasilitas Rumah Dinas	Fasilitatif	214	Dokumen/Rekaman Kegiatan yang berkaitan dengan pelayanan fasilitas rumah\r\ndinas, dengan data pendukung antara lain Berita acara serah terima barang.	t	2026-09-29 03:21:36.664	2026-09-29 03:21:36.664	f
217	MUM.04.03	Pemeliharaan Rumah Dinas	Fasilitatif	214	Dokumen/Rekaman Kegiatan yang berkaitan dengan pemeliharaan rumah dinas,\r\ndengan data pendukung antara lain pelaporan kerusakan, usulan kebutuhan\r\npemeliharaan/perawatan rumah dinas, perbaikan rumah dinas.	t	2026-09-29 03:21:54.427	2026-09-29 03:21:54.427	f
219	MUM.05.01	Pengelolaan Foto Copy	Fasilitatif	218	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengelolaan Foto Copy,\r\nmeliputi penggandaan dan penjilidan	t	2026-09-29 03:22:55.773	2026-09-29 03:22:55.773	f
221	MUM.06.01	Kebersihan Gedung dan Kantor	Fasilitatif	220	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kebersihan Gedung dan\r\nKantor, meliputi antara lain Job Order Requisition (JOR).	t	2026-09-29 03:23:43.031	2026-09-29 03:23:43.031	f
222	MUM.06.02	Kebersihan Taman dan Halaman	Fasilitatif	220	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kebersihan Taman dan\r\nHalaman, meliputi antara lain: penanaman pohon, perapihan pohon, dan kebersihan\r\nlingkungan dan perawatan drainase.	t	2026-09-29 03:24:03.076	2026-09-29 03:24:03.076	f
225	SDM.00.01	Usulan Kebutuhan SDM dari Unit Kerja	Fasilitatif	224	Dokumen/Rekaman Kegiatan yang berkaitan dengan Usulan formasi Kebutuhan\r\nSDM dari Unit Kerja.	t	2026-09-29 03:26:11.197	2026-09-29 03:26:11.197	f
226	SDM.00.02	Persetujuan / Penetapan Kebutuhan SDM	Fasilitatif	224	Dokumen/Rekaman Kegiatan yang berkaitan dengan Persetujuan/ Penetapan\r\nKebutuhan SDM.	t	2026-09-29 03:26:34.669	2026-09-29 03:26:34.669	f
228	SDM.01.01	Pelaksanaan Recruitment	Fasilitatif	227	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pelaksanaan Recruitment,\r\ndengan data pendukung meliputi: pengumuman recruitment, seleksi administrasi,\r\nsurat panggilan test, administrasi ujian tertulis, interview, psikotest dan kesehatan,\r\nkeputusan hasil ujian, penetapan pengumuman kelulusan, dan lain-lain.	t	2026-09-29 03:28:47.094	2026-09-29 03:28:47.094	f
229	SDM.01.02	Berkas Lamaran yang ditolak	Fasilitatif	227	Dokumen/Rekaman Kegiatan yang berkaitan dengan Berkas Lamaran yang ditolak.	t	2026-09-29 03:29:12.98	2026-09-29 03:29:12.98	f
230	SDM.01.03	Diklat Calon Karyawan	Fasilitatif	227	Dokumen/Rekaman Kegiatan yang berkaitan dengan Diklat Calon Karyawan, dengan\r\ndata pendukung: Dokumen terkait proses OJT Calon Karyawan, Permohonan\r\nlnstruktur, Materi Diklat, Penempatan Calon Karyawan.	t	2026-09-29 03:29:45.868	2026-09-29 03:29:45.868	f
231	SDM.01.04	Pengangkatan Karyawan Baru	Fasilitatif	227	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengangkatan Karyawan Baru.	t	2026-09-29 03:30:01.656	2026-09-29 03:30:01.656	f
233	SDM.02.01	Rotasi	Fasilitatif	232	Dokumen/Rekaman Kegiatan yang berkaitan dengan Rotasi kerja dalam rangka\r\npemantapan tugas, dengan data pendukung meliputi: surat usulan, surat\r\nkonfirmasi pelepasan Unit kerja, dan surat penetapan	t	2026-09-29 03:31:09.739	2026-09-29 03:31:09.739	f
235	SDM.02.03	Demosi	Fasilitatif	232	Dokumen/Rekaman Kegiatan yang berkaitan dengan demosi, dengan data\r\npendukung antara lain: Bukti Pelanggaran, dan Surat penetapan	t	2026-09-29 03:31:51.175	2026-09-29 03:31:51.175	f
236	SDM.02.04	Pelaksana Harian	Fasilitatif	232	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pelaksana Harian, dengan data\r\npendukung meliputi Naskah Dinas usulan dari pejabat pengusul\r\n(struktural/fungsional) sesuai Naskah Dinas penetapan sebagai pelaksana harian\r\nkegiatan perusahaan	t	2026-09-29 03:32:13.78	2026-09-29 03:32:13.78	f
234	SDM.02.02	Promosi Jabatan	Fasilitatif	232	Dokumen/Rekaman Kegiatan yang berkaitan dengan Promosi Jabatan,dengan data\r\npendukung meliputi: surat usulan, Surat Persetujuan Direksi, Surat Persetujuan\r\nKomite SDM, Surat Permohonan Analisa dan Evaluasi Jabatan, Surat Hasil Analisa\r\nJob Scoring Jabatan, Surat usulan Uji Hard Competency, Hasil Uji Hard Competency,\r\ndan surat penetapan.	t	2026-09-29 03:31:29.139	2026-09-29 03:33:44.903	f
237	SDM.02.05	Penugasan	Fasilitatif	232	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan penugasan untuk\r\nmelakukan kegiatan, dengan data pendukung antara lain Surat perintah tugas ke\r\npihak ketiga.	t	2026-09-29 03:32:52.289	2026-09-29 03:34:09.855	f
239	SDM.03.01	Komite Appraisal	Fasilitatif	238	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan komite SDM, dengan\r\ndata pendukung: Surat undangan rapat, notulen rapat komite SDM, daftar hadir\r\nrapat.	t	2026-09-29 03:40:39.996	2026-09-29 03:40:39.996	f
241	SDM.04.01	Assesment Potensi	Fasilitatif	240	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Assesment Potensi\r\nKaryawan, dengan data pendukung: dokumen kerjasama dengan pihak ketiga (SP,\r\nInvoice, Surat perintah kerja, berita acara); undangan assesment potensi, daftar\r\nhadir peserta assesment, laporan hasil managemen, laporan hasil individu, dan\r\ntindak lanjut rekomendasi hasil assesment potensi.	t	2026-09-29 03:41:21.798	2026-09-29 03:41:21.798	f
242	SDM.04.02	Assesment Uji Hard Compentency	Fasilitatif	240	Dokumen/Rekaman Kegiatan yang berkaitan dengan Assesment Uji Hard\r\nCompentency	t	2026-09-29 03:41:43.992	2026-09-29 03:41:43.992	f
244	SDM.05.01	Pelanggaran Disiplin	Fasilitatif	243	Dokumen/Rekaman Kegiatan yang berkaitan dengan pelanggaran disiplin\r\nkaryawan, meliputi: Pelanggaran Disiplin Ringan, Pelanggaran Disiplin Sedang,\r\nPelanggaran Disiplin Berat.	t	2026-09-29 03:42:48.142	2026-09-29 03:42:48.142	f
245	SDM.05.02	Sanksi Disiplin	Fasilitatif	243	Dokumen/Rekaman Kegiatan yang berkaitan dengan sanksi disiplin karyawan,\r\nmeliputi: Sanksi Disiplin Ringan, Sanksi Disiplin Sedang, Sanksi Disiplin Berat	t	2026-09-29 03:43:14.56	2026-09-29 03:43:14.56	f
247	SDM.06.01	Remunerasi	Fasilitatif	246	Dokumen/Rekaman Kegiatan yang berkaitan dengan Remunerasi meliputi:\r\nRemunerasi Tetap, Remunerasi Tidak tetap.	t	2026-09-29 03:44:02.651	2026-09-29 03:44:02.651	f
248	SDM.06.02	Perjalanan Dinas I SPPD	Fasilitatif	246	Dokumen/Rekaman Kegiatan yang berkaitan dengan pelaksanaan kegiatan\r\nPerjalanan Dinas I SPPD Dewan Komisaris, Direksi, dan karyawan.	t	2026-09-29 04:00:37.199	2026-09-29 04:00:37.199	f
249	SDM.06.03	Kehadiran Jam Kerja	Fasilitatif	246	Dokumen/Rekaman Kegiatan yang berkaitan dengan pengelolaan Kehadiran/ Jam\r\nKerja terhadap shift karyawan dan non shift karyawan.	t	2026-09-29 04:01:17.798	2026-09-29 04:01:17.798	f
250	SDM.06.04	Izin Cuti I Dispensasi Karyawan	Fasilitatif	246	Dokumen/Rekaman Kegiatan yang berkaitan dengan pengelolaan lzin/Cuti I\r\nDispensasi Karyawan, meliputi: cuti tahunan, cuti besar, cuti melahirkan, izin/\r\ndispensasi.	t	2026-09-29 04:01:43.772	2026-09-29 04:01:43.772	f
251	SDM.06.05	Sistem lnformasi Karyawan	Fasilitatif	246	Dokumen/Rekaman Kegiatan yang berkaitan dengan pengelolaan Sistem\r\nlnformasi Karyawan yang meliputi: system application and product (SAP) dan\r\nmanual aplikasi.	t	2026-09-29 04:02:01.489	2026-09-29 04:02:01.489	f
253	SDM.07.01	TalentManagement	Fasilitatif	252	Dokumen/Rekaman Kegiatan yang berkaitan dengan Talent Management, dengan\r\ndata pendukung meliputi: dokumen talent management (undangan, jalur karir, ICP,\r\nIDP, replacement table card, succest profile, daftar hadir); pool of talents; laporan\r\nhasil assesment centre, Rekap hasil assesment centre	t	2026-09-29 04:03:05.218	2026-09-29 04:03:05.218	f
254	SDM.07.02	Pendidikan Tugas Belajar	Fasilitatif	252	Belajar kepada karyawan perusahaan meliputi: proses pengusulan, pengajuan,\r\nseleksi, hasil TOEFL dan TNA, laporan hasil pemetaan, penentuan/penetapan\r\npelaksana, laporan mengikuti tugas belajar, laporan hasil test masuk ke universitas,\r\ndan laporan perkembangan tugas belajar.	t	2026-09-29 04:03:20.799	2026-09-29 04:03:20.799	f
256	SDM.08.01	Penghargaan Masa kerja Karyawan	Fasilitatif	255	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penghargaan Masa kerja\r\nKaryawan pada masa 1winduan, 2 winduan, 3 winduan, dan 4 winduan.	t	2026-09-29 04:04:12.447	2026-09-29 04:04:12.447	f
257	SDM.08.02	Penghargaan Karyawan Teladan	Fasilitatif	255	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penghargaan karyawan teladan.	t	2026-09-29 04:04:28.326	2026-09-29 04:04:28.326	f
258	SDM.08.03	Penghargaan Karyawan Lainnya	Fasilitatif	255	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penghargaan karyawan lainnya\r\nmeliputi: penghargaan masa Program Berbagi Pengetahuan, Penghargaan lnovator,\r\ndan Penghargaan Penyelamat Aset.	t	2026-09-29 04:04:46.688	2026-09-29 04:04:46.688	f
259	SDM.08.04	Knowledge Management	Fasilitatif	255	- Inovasi\r\n- Knowledge Capturing\r\n- Knowledge Sharing/Workshop/Seminar/Sosialisasi\r\n- Benchmark/Studi Banding	t	2026-09-29 04:05:10.059	2026-09-29 04:05:10.059	f
261	SDM.09.01	Pemeliharaan Kesehatan Karyawan dan Keluarga	Fasilitatif	260	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pemeliharaan Kesehatan\r\nKaryawan dan Keluarga, meliputi rawat jalan, rawat inap, dan rawat refferal	t	2026-09-29 04:06:00.129	2026-09-29 04:06:00.129	f
262	SDM.09.02	Employement Gathering	Fasilitatif	260	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Employement\r\nGathering.	t	2026-09-29 04:07:49.541	2026-09-29 04:07:49.541	f
263	SDM.09.03	Asuransi Tenaga Kerja/ Karyawan	Fasilitatif	260	Dokumen/Rekaman Kegiatan yang berkaitan dengan Asuransi Tenaga kerja/\r\nKaryawan, meliputi penentuan premi dan klaim.	t	2026-09-29 04:08:07.869	2026-09-29 04:08:07.869	f
264	SDM.09.04	Perlengkapan Kerja	Fasilitatif	260	Dokumen/Rekaman Kegiatan yang berkaitan dengan Perlengkapan Kerja meliputi\r\nseragam kerja dan Perlengkapan/atribut kerja.	t	2026-09-29 04:08:25.953	2026-09-29 04:08:25.953	f
265	SDM.09.05	Santunan Uang Duka	Fasilitatif	260	Dokumen/Rekaman Kegiatan yang berkaitan dengan Santunan Uang Duka.	t	2026-09-29 04:08:59.888	2026-09-29 04:08:59.888	f
266	SDM.09.06	Bantuan Pinjaman Pemilikan Rumah/ BPRP	Fasilitatif	260	Dokumen/Rekaman Kegiatan yang berkaitan dengan fasilitas Bantuan Pinjaman\r\nPemilikan Rumah/ BPRP kepada karyawan perusahaan.	t	2026-09-29 04:09:16.784	2026-09-29 04:09:16.784	f
268	SDM.10.01	Bidang Keagamaan	Fasilitatif	267	Dokumen/Rekaman Kegiatan yang berkaitan dengan pembinaan kepada karyawan\r\nBidang Keagamaan.	t	2026-09-29 04:10:04.476	2026-09-29 04:10:04.476	f
269	SDM.10.02	Bidang Olahraga	Fasilitatif	267	Dokumen/Rekaman Kegiatan yang berkaitan dengan pembinaan kepada karyawan\r\nBidangOlahraga.	t	2026-09-29 04:10:27.144	2026-09-29 04:10:27.144	f
270	SDM.10.03	Bidang Seni	Fasilitatif	267	Dokumen/Rekaman Kegiatan yang berkaitan dengan pembinaan kepada karyawan\r\nBidang Seni	t	2026-09-29 04:10:43.679	2026-09-29 04:10:43.679	f
271	SDM.10.04	Bintal Karyawan dan Keluarga	Fasilitatif	267	Dokumen/Rekaman Kegiatan yang berkaitan dengan pembinaan kepada karyawan\r\ntentang Bintal Karyawan dan Keluarga.	t	2026-09-29 04:11:16.929	2026-09-29 04:11:16.929	f
273	SDM.11.01	Dana Pensiun	Fasilitatif	272	Dokumen/Rekaman Kegiatan yang berkaitan dengan pengelolaan dana pensiun,\r\nmeliputi: Pengangkatan pengurus,Pengangkatan Dewan Pengawas, Peraturan Dana\r\nPensiun (PDP), Arahan lnvestasi.	t	2026-09-29 04:13:17.066	2026-09-29 04:13:17.066	f
275	SDM.12.01	Serikat Pekerja	Fasilitatif	274	Dokumen/Rekaman Kegiatan yang berkaitan dengan pengelolaan Organisasi Serikat\r\nPekerja.	t	2026-09-29 04:14:02.954	2026-09-29 04:14:02.954	f
276	SDM.12.02	Persatuan lstri Karyawan	Fasilitatif	274	Dokumen/Rekaman Kegiatan yang berkaitan dengan pengelolaan Organisasi\r\nPersatuan lstri Karyawan.	t	2026-09-29 04:14:20.233	2026-09-29 04:14:20.233	f
277	SDM.12.03	Koperasi Karyawan	Fasilitatif	274	Dokumen/Rekaman Kegiatan yang berkaitan dengan pengelolaan KoperasiKaryawan	t	2026-09-29 04:14:43.598	2026-09-29 04:14:43.598	f
278	SDM.12.04	YPK	Fasilitatif	274	Dokumen/Rekaman Kegiatan yang berkaitan dengan YPK.	t	2026-09-29 04:15:10.109	2026-09-29 04:15:10.109	f
279	SDM.12.05	IKA PLN	Fasilitatif	274	Dokumen/Rekaman Kegiatan yang berkaitan dengan IKA PLN.	t	2026-09-29 04:15:40.109	2026-09-29 04:15:40.109	f
280	SDM.12.06	Organisasi Non Kedinasan Lainnya	Fasilitatif	274	Dokumen/Rekaman Kegiatan yang berkaitan dengan Organisasi Non Kedinasan\r\nLainnya di lingkungan PLN.	t	2026-09-29 04:16:02.463	2026-09-29 04:16:02.463	f
282	SDM.13.01	Pemutusan Hubungan Kerja dengan Hormat	Fasilitatif	281	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kegiatan Pemutusan\r\nHubungan Kerja dengan hormat, mulai dari proses awal sampai dengan Surat\r\npenetapan PHK.	t	2026-09-29 04:16:59.873	2026-09-29 04:16:59.873	f
283	SDM.13.02	Pemutusan Hubungan Kerja dengan Tidak Hormat	Fasilitatif	281	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kegiatan Pemutusan\r\nHubungan Kerja dengan tidak hormat, mulai dari proses awal sampai dengan Surat\r\npenetapan PHK.	t	2026-09-29 04:17:35.631	2026-09-29 04:17:35.631	f
285	SDM.14.01	Penyelesaian Bidang Ketenagakerjaan/Sengketa Karyawan	Fasilitatif	284	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Penyelesaian Bidang\r\nKetenagakerjaan/Sengketa Karyawan	t	2026-09-29 04:18:47.168	2026-09-29 04:18:47.168	f
287	SDM.15.01	Personal file	Fasilitatif	286	Dokumen/Rekaman Kegiatan yang berkaitan dengan personal file karyawan PLN\r\nmulai dari Komisaris, Direksi, dan karyawan, dengan data pendukung antara lain\r\nmeliputi: berkas lamaran kerja, SK pengangkatan, SK kenaikan pangkat, SK\r\nmutasi/rotasi/pindah instansi, SK cuti/izin, SK Kenaikan Jabatan, SK pelantikan\r\njabatan, SK penempatan dan perpindahan karyawan, data keluarga (Surat nikah\r\nistri/suami, akta anak, dll), SK pensiun, dan lain-lain.	t	2026-09-29 04:20:12.988	2026-09-29 04:20:27.091	f
290	DLT.00.01	Training Need Analysis	Fasilitatif	289	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Training Need\r\nAnalysis, dengan data pendukung: usulan kegiatan pelatihan, usulan kebutuhan\r\nprogram Pendidikan dan pelatihan dari Unit Kerja, dan lain-lain.	t	2026-09-29 04:43:46.854	2026-09-29 04:43:46.854	f
291	DLT.00.02	Program Diklat Tahunan	Fasilitatif	289	Dokumen/Rekaman Kegiatan yang berkaitan dengan Program Diklat Tahunan,\r\ndengan data pendukung: Rencana Anggaran Pelatihan Tahunan, TOR, Dokumen\r\nService Request, Owner Estimate, Penunjukan Langsung, Proposal Pengajuan\r\nAnggaran, dll.; Program Diklat Tahunan (rencana anggaran pelatihan tahunan, TOR,\r\ndokumen service request, owner estimate, penunjukan langsung vendor, proposal\r\npengajuan anggaran); Kurikulum Diklat; Bahan Ajar Diklat.	t	2026-09-29 04:44:16.392	2026-09-29 04:44:16.392	f
292	DLT.00.03	Kurikulum/Silabus Diklat	Fasilitatif	289	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kurikulum/Silabus Diklat.	t	2026-09-29 04:44:35.336	2026-09-29 04:44:35.336	f
293	DLT.00.04	Bahan Ajar Diklat	Fasilitatif	289	Dokumen/Rekaman Kegiatan yang berkaitan dengan Bahan Ajar Diklat yang\r\ndijadikan sebagai acuan dalam pelaksanaan kegiatan pendidikan dan pelatihan	t	2026-09-29 04:44:52.364	2026-09-29 04:44:52.364	f
295	DLT.01.01	Diklat Offside	Fasilitatif	294	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Pelaksanaan Diklat\r\nOffside, meliputi: konfirmasi pelatihan, persetujuan penggunaan anggaran Unit kerja,\r\nSurat izin pelaksanaan pelatihan kepada GM, penawaran harga/biaya training\r\n(Provider), pendaftaran pelatihan, SPT pelatihan, Laporan Pelaksanaan Pelatihan\r\n(LPP), dan formulir isian tentang Evaluasi Lembaga Pelatihan (FELP).	t	2026-09-29 04:45:49.916	2026-09-29 04:45:49.916	f
296	DLT.01.02	Diklat lnhouse	Fasilitatif	294	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Pelaksanaan Diklat\r\nlnhouse, dengan data pendukung: Konfirmasi Peserta Pelatihan, Undangan\r\npelatihan, Dokumentasi Pelatihan, JOR, Laporan Pelatihan (FEP, FEHK,FEI), Daftar\r\nHadir Pelatihan, Administrasi Honor lnstruktur, Copy sertifikat, dan laporan\r\npenyelenggaraan pelatihan.	t	2026-09-29 04:46:05.884	2026-09-29 04:46:05.884	f
298	DLT.02.01	Evaluasi Diklat	Fasilitatif	297	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan evaluasi\r\npenyelenggaraan Pendidikan dan Pelatihan yang meliputi: Evaluasi Pelaksanaan\r\nPelatihan (FEP); Evaluasi Harapan & Kepuasan Peserta Pelatihan (FEHK), Evaluasi\r\nlnstruktur (FEI), Evaluasi Lembaga Pelatihan, Evaluasi ROTI (Return of Training\r\nlnvesment).	t	2026-09-29 04:46:43.445	2026-09-29 04:46:43.445	f
300	DLT.03.01	DatabaseISistem lnformasi Diklat	Fasilitatif	299	Dokumen/Rekaman Kegiatan yang berkaitan dengan Database I Sistem lnformasi\r\nDiklat.	t	2026-09-29 04:47:23.99	2026-09-29 04:47:23.99	f
310	STI.04.02	Migrasi Data	Fasilitatif	309	Dokumen/Rekaman Kegiatan yang berkaitan dengan Migrasi Data, meliputi:\r\nPerencanaan Migrasi, Pelaksanaan Migrasi, Berita Acara Kegiatan Migrasi,\r\nDaftar Sistem Aplikasi dan Data yang dimigrasi, dan Laporan Migrasi.	t	2026-09-29 04:52:52.617	2026-09-29 06:26:54.513	f
306	STI.02.02	Pemeliharaan Hardware	Fasilitatif	312	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pemeliharaan Hardware,\r\ndengan data pendukung:memo, Job Order Request, Laporan Pemeliharaan	t	2026-09-29 04:50:15.152	2026-09-29 06:27:31.711	f
313	STI.01.02	Pengembangan Aplikasi	Fasilitatif	304	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengembangan Aplikasi.	t	2026-09-29 06:28:48.907	2026-09-29 06:28:48.907	f
303	STI.00.01	Master Plan Sistem lnformasi	Fasilitatif	302	Dokumen/Rekaman Kegiatan yang berkaitan dengan Master Plan Sistem lnformasi.	t	2026-09-29 04:48:54.025	2026-09-29 06:25:19.945	f
305	STI.01.01	Administrator dan Konfigurasi	Fasilitatif	304	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pemeliharaan Jaringan,\r\ndengan data pendukung: memo, Job Order Request, Laporan Pemeliharaan	t	2026-09-29 04:49:55.27	2026-09-29 06:25:35.562	f
311	STI.01.03	Pemeliharaan Aplikasi	Fasilitatif	304	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pemeliharaan Aplikasi.	t	2026-09-29 04:53:32.854	2026-09-29 06:25:49.874	f
308	STI.04.01	Back up Data	Fasilitatif	309	Dokumen/Rekaman Kegiatan yang berkaitan dengan Back up Data,\r\nmeliputi: Permintaan Back Up Data dan Permintaan Data Digital.	t	2026-09-29 04:51:10.538	2026-09-29 06:26:41.045	f
314	STI.02.01	Pemeliharaan Jaringan	Fasilitatif	312	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pemeliharaan Jaringan,\r\ndengan data pendukung: memo, Job Order Request, Laporan Pemeliharaan	t	2026-09-29 06:29:39.592	2026-09-29 06:30:35.431	f
315	STI.03.01	Penyediaan Hardware	Fasilitatif	307	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penyediaan Hardware,\r\nmeliputi: Permintaan User, Persetujuan,dan Berita Acara Pelayanan.	t	2026-09-29 06:32:18.142	2026-09-29 06:32:18.142	f
316	STI.03.02	Penyediaan Software	Fasilitatif	307	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penyediaan Software, dengan\r\ndata pendukung: Surat permintaan dari user, Surat persetujuan, dan Berita Acara\r\nSerah Terima.	t	2026-09-29 06:32:51.996	2026-09-29 06:32:51.996	f
318	STI.05.01	Data Center	Fasilitatif	317	Dokumen/Rekaman Kegiatan yang berkaitan dengan Data Center.	t	2026-09-29 06:34:14.298	2026-09-29 06:34:14.298	f
321	SPI.00.01	Program Audit Tahunan	Fasilitatif	320	Dokumen/Rekaman Kegiatan yang berkaitan dengan Program Audit Tahunan.	t	2026-09-29 06:36:12.388	2026-09-29 06:36:48.165	f
322	SPI.00.02	Daftar Auditor Internal	Fasilitatif	320	Dokumen/Rekaman Kegiatan yang berkaitan dengan Daftar Auditor Internal.	t	2026-09-29 06:37:13.977	2026-09-29 06:37:13.977	f
324	SPI.01.01	Pengawasan Keuangan	Fasilitatif	323	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengawasan Keuangan,\r\ndengan data pendukung: Kertas Kerja Pengawasan, Notice, Laporan Hasil Audit\r\nInternal, Management Letter, dan Tindak Lanjut Hasil Pengawasan	t	2026-09-29 06:38:08.268	2026-09-29 06:38:08.268	f
325	SPI.01.02	Pengawasan Operasional	Fasilitatif	323	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengawasan Operasional,\r\ndengan data pendukung: Kertas Kerja Pengawasan, Notice, Laporan Hasil Audit\r\nInternal, Management Letter, dan Tindak Lanjut Hasil Pengawasan.	t	2026-09-29 06:45:27.823	2026-09-29 06:45:27.823	f
326	SPI.01.03	Pengawasan Khusus/ atas Permintaan	Fasilitatif	323	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengawasan Khusus/ atas\r\nPermintaan, dengan data pendukung: Kertas Kerja Pengawasan, Notice, Laporan\r\nHasil Audit Internal, Management Letter, dan Tindak Lanjut Hasil Pengawasan.	t	2026-09-29 06:45:53.842	2026-09-29 06:45:53.842	f
327	SPI.01.04	Pengawasan Kegiatan Lainnya	Fasilitatif	323	Pengawasan Kegiatan Lainnya, dengan data pendukung: Kertas Kerja\r\nPengawasan, Notice, Laporan Hasil Audit Internal, Management Letter, dan\r\nTindak Lanjut Hasil Pengawasan.	t	2026-09-29 06:46:20.384	2026-09-29 06:46:20.384	f
329	SPI.02.01	Laporan Hasil Audit Badan Pemeriksa Keuangan (BPK)	Fasilitatif	328	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Hasil Audit Badan\r\nPemeriksa Keuangan.	t	2026-09-29 06:47:18.84	2026-09-29 06:47:18.84	f
330	SPI.02.02	Laporan Hasil Audit Badan Pemeriksa Keuangan dan Pembangunan (BPKP)	Fasilitatif	328	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Hasil Audit Badan\r\nPemeriksa Keuangan dan Pembangunan (BPKP).	t	2026-09-29 06:47:40.732	2026-09-29 06:47:40.732	f
332	SPI.02.04	Laporan Auditor lndependen (Audited)	Fasilitatif	328	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Auditor\r\nlndependen (audited).	t	2026-09-29 06:48:25.964	2026-09-29 06:48:25.964	f
334	SPI.03.01	Monitoring Tindaklanjut Pengawasan	Fasilitatif	333	Dokumen/Rekaman Kegiatan yang berkaitan dengan Monitoring Tindak lanjut\r\nPengawasan	t	2026-09-29 06:49:13.953	2026-09-29 06:49:13.953	f
335	SPI.03.02	Laporan Hasil Evaluasi Monitoring Tindak Lanjut	Fasilitatif	333	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Hasil Evaluasi\r\nMonitoring Tindak Lanjut	t	2026-09-29 06:49:41.107	2026-09-29 06:49:41.107	f
337	SPI.04.01	Laporan Tindakan Koreksi dan Pencegahan (LTKP)	Fasilitatif	336	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Tindakan Koreksi dan\r\nPencegahan (LTKP)	t	2026-09-29 06:50:40.31	2026-09-29 06:50:40.31	f
352	KBL.00.01	Penyaluran Pinjaman Program Kemitraan	Fasilitatif	351	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penyaluran Pinjaman Program\r\nKemitraan, dengan data pendukung meliputi: rekening koran, proposal permohonan,\r\nsurvei, hasil evaluasi, keputusan pemberian bantuan, perjanjian kerjasama/Surat\r\nperjanjian, voucer transaksi, Surat jaminan (BPKB, sertifikat tanah/bangunan).	t	2026-09-29 06:58:18.542	2026-09-29 06:58:18.542	f
353	KBL.00.02	Monitoring, Rescheduling, Reconditioning dan Penagihan	Fasilitatif	351	Dokumen/Rekaman Kegiatan yang berkaitan dengan Monitoring, Rescheduling,\r\nReconditioning dan Penagihan.	t	2026-09-29 06:58:51.61	2026-09-29 07:02:32.295	f
354	KBL.00.03	Pembinaan Kemitraan	Fasilitatif	351	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pembinaan Kemitraan,\r\nmeliputi: promosi hasil kemitraan, penagihan.	t	2026-09-29 07:02:55.37	2026-09-29 07:02:55.37	f
355	KBL.00.04	Pelaporan Program Kemitraan	Fasilitatif	351	Dokumen/Rekaman Kegiatan yang berkaitan dengan kegiatan Pelaporan Program\r\nKemitraan.	t	2026-09-29 07:03:15.141	2026-09-29 07:03:15.141	f
357	KBL.01.01	Sosial Kemasyarakatan	Fasilitatif	356	Dokumen/Rekaman Kegiatan yang berkaitan dengan Sosial Kemasyarakatan,\r\ndengan data pendukung: proposal permohonan, hasil evaluasi survei, keputusan\r\npemberian bantuan, dan berita acara penyerahan bantuan.	t	2026-09-29 07:03:52.316	2026-09-29 07:03:52.316	f
358	KBL.01.02	Bantuan Pendidikan	Fasilitatif	356	Dokumen/Rekaman Kegiatan yang berkaitan dengan Bantuan Pendidikan,\r\ndengan data pendukung: proposal permohonan, hasil evaluasi survei, keputusan\r\npemberian bantuan, dan berita acara penyerahan bantuan.	t	2026-09-29 07:04:22.013	2026-09-29 07:04:22.013	f
359	KBL.01.03	Pelestarian Alam	Fasilitatif	356	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pelestarian Alam, dengan\r\ndata pendukung: proposal permohonan, hasil evaluasi survei, keputusan\r\npemberian bantuan, dan berita acara penyerahan bantuan.	t	2026-09-29 07:04:38.435	2026-09-29 07:04:38.435	f
360	KBL.01.04	Bantuan Kesehatan	Fasilitatif	356	Dokumen/Rekaman Kegiatan yang berkaitan dengan bantuan kesehatan,\r\ndengan data pendukung: proposal permohonan, hasil evaluasi survei,\r\nkeputusan pemberian bantuan, dan berita acara penyerahan bantuan.	t	2026-09-29 07:05:06.411	2026-09-29 07:05:06.411	f
361	KBL.01.05	Sarana Umum	Fasilitatif	356	Dokumen/Rekaman Kegiatan yang berkaitan dengan Sarana Umum, dengan\r\ndata pendukung: proposal permohonan, hasil evaluasi survei, keputusan\r\npemberian bantuan, dan berita acara penyerahan bantuan.	t	2026-09-29 07:05:44.613	2026-09-29 07:05:44.613	f
362	KBL.01.06	Sarana lbadah	Fasilitatif	356	Dokumen/Rekaman Kegiatan yang berkaitan dengan Sarana lbadah, dengan\r\ndata pendukung: proposal permohonan, hasil evaluasi survei, keputusan\r\npemberian bantuan, dan berita acara penyerahan bantuan.	t	2026-09-29 07:06:00.28	2026-09-29 07:06:00.28	f
363	KBL.01.07	Bencana Alam	Fasilitatif	356	Dokumen/Rekaman Kegiatan yang berkaitan dengan Bencana Alam, dengan data\r\npendukung: proposal permohonan, hasil evaluasi survei, keputusan pemberian\r\nbantuan, dan berita acara penyerahan bantuan	t	2026-09-29 07:06:19.778	2026-09-29 07:06:19.778	f
364	KBL.01.08	Pelaporan Bina Lingkungan	Fasilitatif	356	Dokumen/Rekaman Kegiatan yang berkaitan dengan penyusunan Pelaporan Bina\r\nLingkungan.	t	2026-09-29 07:06:39.068	2026-09-29 07:06:39.068	f
367	KLH.00.01	Pengukuran Kondisi Lingkungan Kerja	Fasilitatif	366	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengukuran Kondisi\r\nLingkungan Kerja, dengan data pendukung antara lain: Data Hasil Pengukuran	t	2026-09-29 07:07:34.571	2026-09-29 07:07:34.571	f
368	KLH.00.02	Distribusi P3K	Fasilitatif	366	Dokumen/Rekaman Kegiatan yang berkaitan dengan Distribusi P3K, dengan data\r\npendukung antara lain: Daftar Keberadaan P3K, Hasil Pengecekan.	t	2026-09-29 07:07:52.918	2026-09-29 07:07:52.918	f
369	KLH.00.03	Cek Kesehatan Berkala	Fasilitatif	366	Dokumen/Rekaman Kegiatan yang berkaitan dengan Cek Kesehatan Berkala,\r\ndengan data pendukung antara lain: Jadwal pemeriksaan, Hasil pemeriksaan dan\r\nrekomendasi.	t	2026-09-29 07:08:20.243	2026-09-29 07:08:20.243	f
371	KLH.01.01	lnformasi Keselamatan (Safety Information)	Fasilitatif	370	Dokumen/Rekaman Kegiatan yang berkaitan dengan lnformasi\r\nKeselamatan/Safety Information, meliputi: Pengarahan Keselamatan Kerja/Safety\r\nInduction (Redaksi Induction, Video, Daftar Hadir); Rambu-rambu Keselamatan\r\nKerja.	t	2026-09-29 07:08:55.873	2026-09-29 07:08:55.873	f
372	KLH.01.02	lnspeksi Berkala	Fasilitatif	370	Dokumen/Rekaman Kegiatan yang berkaitan dengan lnspeksi Berkala yaitu dua\r\nmingguan dan Safety Management Work True, dengan data pendukung: Laporan\r\nlnspeksi, Daftar Hadir, dan Tindak Lanjut Temuan (Laporan).	t	2026-09-29 07:09:11.015	2026-09-29 07:09:11.015	f
374	KLH.02.01	Pemberian lzin Kerja di area Perusahaan	Fasilitatif	373	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pemberian ljin Kerja di area\r\nPerusahaan, dengan data pendukung meliputi: lzin Kerja (Work Permit), lzin Foto,\r\ndan Daftar lzin.	t	2026-09-29 07:09:49.915	2026-09-29 07:09:49.915	f
375	KLH.02.02	ldentifikasi Bahaya K3	Fasilitatif	373	Dokumen/Rekaman Kegiatan yang berkaitan dengan ldentifikasi Bahaya K3,\r\ndengan data pendukung:Hasil ldentifikasi, Hasil analisa ldentifikasi, dan Job Safety\r\nAnalisis (JSA).	t	2026-09-29 07:10:30.299	2026-09-29 07:10:30.299	f
376	KLH.02.03	Safety Analysis	Fasilitatif	373	Dokumen/Rekaman Kegiatan yang berkaitan dengan Safety Analysis, dengan data\r\npendukung: Laporan Keselamatan Kerja, Laporan Kesehatan Kerja.	t	2026-09-29 07:10:48.895	2026-09-29 07:10:48.895	f
377	KLH.02.04	lnvestigasi Kecelakaan	Fasilitatif	373	Dokumen/Rekaman Kegiatan yang berkaitan dengan lnvestigasi Kecelakaan,\r\ndengan data pendukung: Laporan lnvestigasi, Bukti lnvestigasi	t	2026-09-29 07:11:05.648	2026-09-29 07:11:05.648	f
378	KLH.02.05	Safety Equipment	Fasilitatif	373	Dokumen/Rekaman Kegiatan yang berkaitan dengan Safety Equipment, dengan\r\ndata pendukung: Fire Alarm, Hydrant, Alat Pelindung Diri, Sarana Pemadam\r\nKebakaran.	t	2026-09-29 07:11:37.379	2026-09-29 07:11:37.379	f
380	KLH.03.01	Pengamanan Terbuka	Fasilitatif	379	Dokumen/Rekaman Kegiatan yang berkaitan denganPengamanan Terbuka,\r\ndengan data pendukung meliputi: Pengaturan jadwal Pengamanan; Penjagaan\r\nkeamanan (pencurian, terorisme,sabotase, dll., dengan data pendukung buku jurnal,\r\ndaftar inventaris material, jadwal kegiatan, laporan kegiatan penjagaan, laporan\r\nkejadian, Surat perintah lembur, berita acara pemeriksaan pelanggaran/kriminal di\r\narea perusahaan); Pengawalan (dengan data pendukung: Surat permintaan\r\npengawalan dari Unit kerja/tamu perusahaan); Patroli Keamanan	t	2026-09-29 07:12:25.643	2026-09-29 07:12:25.643	f
381	KLH.03.02	Pengamanan Tertutup	Fasilitatif	379	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengamanan Tertutup,\r\nmeliputi: dengan data pendukung meliputi: Pengamanan internal dan eksternal;\r\nPengelolaan ID Card Non Pegawai (Badge kontraktor); Pengelolaan Stiker\r\nKendaraan dinas dan pribadi; Monitoring pengamanan tertutup; dan Perizinan\r\nKendaraan MasukWilayah.	t	2026-09-29 07:12:53.378	2026-09-29 07:12:53.378	f
382	KLH.03.03	Pengelolaan dan Pengoperasian CCTV	Fasilitatif	379	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengelolaan dan\r\nPengoperasian CCTV.	t	2026-09-29 07:13:25.425	2026-09-29 07:13:25.425	f
383	KLH.03.04	lzin Perpanjangan dan Penggunaan Senjata Api	Fasilitatif	379	Dokumen/Rekaman Kegiatan yang berkaitan dengan izin Perpanjangan dan\r\nPenggunaan Senjata Api, meliputi: Personil yang menggunakan; kelayakan senjata\r\napi yang digunakan	t	2026-09-29 07:14:05.022	2026-09-29 07:14:05.022	f
384	KLH.03.05	Kerjasama Bidang Kamtibmas dengan TNI dan Polri	Fasilitatif	379	Dokumen/Rekaman Kegiatan yang berkaitan dengan Kerjasama Bidang Kamtibmas\r\ndengan TNI dan Polri dalam hal keamanan dan ketertiban	t	2026-09-29 07:14:37.482	2026-09-29 07:14:37.482	f
386	KLH.04.01	Simulasi Tanggap Darurat	Fasilitatif	385	Dokumen/Rekaman Kegiatan yang berkaitan dengan Simulasi Tanggap Darurat,\r\ndengan data pendukung: Jadwal, Pemberitahuan pelaksanaan Simulasi, Laporan\r\nKegiatan.	t	2026-09-29 07:15:55.163	2026-09-29 07:15:55.163	f
387	KLH.04.02	Training K3	Fasilitatif	385	Dokumen/Rekaman Kegiatan yang berkaitan dengan Training K3, dengan data\r\npendukung: Surat Pemberitahuan, Daftar lnstruksi	t	2026-09-29 07:16:41.941	2026-09-29 07:16:41.941	f
388	KLH.04.03	Training Evaluasi Penggunaan Alat	Fasilitatif	385	Dokumen/Rekaman Kegiatan yang berkaitan dengan Training Evaluasi\r\nPenggunaan Alat, dengan data pendukung: Surat Pemberitahuan,Daftar lnstruksi	t	2026-09-29 07:17:00.192	2026-09-29 07:17:00.192	f
389	KLH.04.04	Penghargaan K3	Fasilitatif	385	Dokumen/Rekaman Kegiatan yang berkaitan dengan Penghargaan K3, dengan\r\ndata pendukung antara lain: Daftar penerima Penghargaan	t	2026-09-29 07:17:25.996	2026-09-29 07:17:25.996	f
390	KLH.04.05	Lomba K3	Fasilitatif	385	Dokumen/Rekaman Kegiatan yang berkaitan dengan Lomba K3, dengan data\r\npendukung antara lain: Penilaian, Daftar Pemenang.	t	2026-09-29 07:18:03.753	2026-09-29 07:18:03.753	f
392	KLH.05.01	lnspeksi K3	Fasilitatif	391	Dokumen/Rekaman Kegiatan yang berkaitan dengan lnspeksi K3, dengan data\r\npendukung: Temuan kondisi kerja, Perilaku Kerja berbahaya.	t	2026-09-29 07:18:54.675	2026-09-29 07:18:54.675	f
393	KLH.05.02	Laporan Kejadian Bencana	Fasilitatif	391	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Kejadian Bencana\r\n(Kebakaran, Kebocoran bahan kimia, kecelakaan kerja, bencana alam, dll), dengan\r\ndata pendukung antara lain: Laporan Kejadian	t	2026-09-29 07:20:05.65	2026-09-29 07:20:05.65	f
394	KLH.05.03	Pemeliharaan Peralatan Penanggulangan	Fasilitatif	391	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pemeliharaan Peralatan\r\nPenanggulangan, dengan data pendukung: Laporan Mingguan, Laporan Bulanan,\r\ndan Laporan Tahunan.	t	2026-09-29 07:21:11.072	2026-09-29 07:21:11.072	f
395	KLH.05.04	Tindak Lanjut Laporan Kejadian	Fasilitatif	391	Dokumen/Rekaman Kegiatan yang berkaitan dengan Tindak Lanjut Laporan\r\nKejadian meliputi: Modifikasi Sarana Peralatan Terkait Penanggulangan (Surat\r\nRancangan Modifikasi, Rincian Material Modifikasi) ; Peningkatan Pengawasan; dan\r\nPeningkatan Kelengkapan Safety Equipment	t	2026-09-29 07:21:27.98	2026-09-29 07:21:27.98	f
397	KLH.06.01	Panitia Pembina Keselamatan & Kesehatan Kerja (P2K3)	Fasilitatif	396	Dokumen/Rekaman Kegiatan yang berkaitan dengan Panitia Pembina\r\nKeselamatan &\r\nKesehatan Kerja (P2K3), dengan data pendukung: Laporan P2K3, Notulen Rapat\r\nP2K3.	t	2026-09-29 07:22:06.457	2026-09-29 07:22:06.457	f
399	KLH.07.01	Safety Management	Fasilitatif	398	Dokumen/Rekaman Kegiatan yang berkaitan dengan Safety Management	t	2026-09-29 07:22:40.296	2026-09-29 07:22:40.296	f
401	KLH.08.01	Contractor Safety Management System (CSMS)	Fasilitatif	400	Dokumen/Rekaman Kegiatan yang berkaitan dengan Contractor Safety\r\nManagement System(CSMS).	t	2026-09-29 07:23:40.206	2026-09-29 07:23:40.206	f
403	KLH.09.01	Gugus Pengendali Kebakaran (Gupenkar)	Fasilitatif	402	Dokumen/Rekaman Kegiatan yang berkaitan dengan Gugus Pengendali Kebakaran\r\n(Gupenkar).	t	2026-09-29 07:24:15.264	2026-09-29 07:24:15.264	f
405	KLH.10.01	Safety Representative	Fasilitatif	404	Dokumen/Rekaman Kegiatan yang berkaitan dengan Safety Representative.	t	2026-09-29 07:25:04.189	2026-09-29 07:25:04.189	f
407	KLH.11.01	Sistem Manajemen Kesehatan dan Keselamatan Kerja	Fasilitatif	406	Dokumen/Rekaman Kegiatan yang berkaitan dengan Sistem Manajemen Kesehatan\r\ndan Keselamatan Kerja.	t	2026-09-29 07:25:47.461	2026-09-29 07:25:47.461	f
514	MNJ.03.03	Pengembangan Bahan Pustaka	Fasilitatif	192	Dokumen/Rekaman Kegiatan yang berkaitan dengan Pengembangan Bahan\r\nPustaka, meliputi: Penyimpanan Deposit Bahan Pustaka; Pengembangan Koleksi\r\n(Akuisisi: pembelian, hibah, dan hadiah; Pengelolaan Bahan Pustaka, dan\r\nDatabase Katalog Koleksi).	t	2026-09-29 09:08:39.154	2026-09-29 09:08:39.154	f
515	MNJ.03.04	Jasa Perpustakaan dan lnformasi	Fasilitatif	192	Dokumen/Rekaman Kegiatan yang berkaitan dengan Jasa Perpustakaan dan\r\nlnformasi, meliputi: Keanggotaan (formulir pendaftaran, dan kartu anggota);\r\nSirkulasi (pemanfaatan koleksi perpustakaan oleh pemakai\r\nperpustakaan/peminjaman bahan pustaka); Referensi (pelayanan/penyajian\r\nkoleksi, pertanyaan-pertanyaan dan jawaban-jawaban dari pengguna/pengunjung\r\ndengan menggunakan referensi); dan database layanan perpustakaan.	t	2026-09-29 09:09:27.266	2026-09-29 09:09:27.266	f
516	MNJ.03.05	Preservasi Bahan Pustaka	Fasilitatif	192	Dokumen/Rekaman Kegiatan yang berkaitan dengan Preservasi Bahan Pustaka,\r\nmeliputi: Survei kondisi Bahan Pustaka; Konservasi (Perawatan Bahan Pustaka,\r\nPerbaikan Bahan Pustaka, Penjilidan Bahan Pustaka); Reprografi Bahan Pustaka\r\n(memperbaiki koleksi perpustakaan yang rusak dengan melalui alih media\r\nmikrografi), pemeliharaan, perawatan, penyimpanan dan fotografi.	t	2026-09-29 09:09:50.032	2026-09-29 09:09:50.032	f
331	SPI.02.03	Laporan Hasil Audit Kantor Akuntan Publik (KAP)	Fasilitatif	328	Dokumen/Rekaman Kegiatan yang berkaitan dengan Laporan Hasil Audit Kantor\r\nAkuntan Publik (KAP).	t	2026-09-29 06:48:03.036	2026-09-30 02:46:06.336	f
\.


--
-- TOC entry 5158 (class 0 OID 16553)
-- Dependencies: 227
-- Data for Name: lokasi_penyimpanan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lokasi_penyimpanan (id, jenis_lokasi, kode, nama, parent_id, keterangan, aktif, created_at, updated_at, is_induk) FROM stdin;
10	Gedung Arsip	LF-1-1	Rak	9	Lemari Rak	t	2026-09-09 06:33:57.681	2026-09-09 06:34:06.157	f
11	Gedung Arsip	LF-1-2	Rak	9	Lemari Rak	t	2026-09-09 06:34:29.287	2026-09-09 06:34:29.287	f
9	Gedung Arsip	LF-1	Rak	\N	Lemari Rak	t	2026-09-09 06:33:40.856	2026-09-09 06:52:30.889	t
\.


--
-- TOC entry 5163 (class 0 OID 17085)
-- Dependencies: 232
-- Data for Name: pengaturan_sistem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pengaturan_sistem (id, nama_instansi, nama_sistem, deskripsi, tema, notifikasi_aktif, created_at, updated_at) FROM stdin;
1	PLN Batam	tes	Sistem Informasi Manajemen Arsip	terang	f	2026-09-09 07:05:46.977	2026-10-01 02:07:37.494
\.


--
-- TOC entry 5167 (class 0 OID 28134)
-- Dependencies: 236
-- Data for Name: penyerahan_arsip; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.penyerahan_arsip (id, user_id, divisi_id, tanggal_penyerahan, status, pihak_pertama_id, pihak_pertama_nama, pihak_kedua_id, pihak_kedua_nama, sumber_penyerahan, nomor_berita_acara, file_berita_acara, keterangan, created_at, updated_at) FROM stdin;
42	2	3	2026-10-15	DIKONFIRMASI	2	Ilham	2	Ilham	SDM - Sumber Daya Manusia	......./BA/15-10-2026	/uploads/arsip/berita-acara/ba-42-ffb6dcaf.pdf	\N	2026-10-15 03:02:53.549	2026-10-15 03:03:46.84
41	2	3	2026-10-09	DIKONFIRMASI	2	Ilham	\N	\N	SDM - Sumber Daya Manusia	......./BA/09-10-2026	/uploads/arsip/berita-acara/ba-41-5cc1e769.pdf	\N	2026-10-09 03:48:42.498	2026-10-15 03:04:19.749
43	2	3	2026-10-16	DIKONFIRMASI	2	Ilham	2	Ilham	SDM - Sumber Daya Manusia	......./BA/16-10-2026	/uploads/arsip/berita-acara/ba-43-b9045b6c.pdf	TES1	2026-10-16 02:21:31.103	2026-10-16 02:22:17.547
44	2	3	2026-10-16	DIKONFIRMASI	2	Ilham	2	Ilham	SDM - Sumber Daya Manusia	......./BA/16-10-2026	/uploads/arsip/berita-acara/ba-44-5c715bae.pdf	TES 2	2026-10-16 02:23:00.403	2026-10-16 02:28:11.76
45	2	3	2026-10-16	DIKONFIRMASI	2	Ilham	2	Ilham	SDM - Sumber Daya Manusia	\N	\N	TES3	2026-10-16 02:37:01.972	2026-10-16 02:41:29.209
\.


--
-- TOC entry 5160 (class 0 OID 16571)
-- Dependencies: 229
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, nama, username, email, password, role, aktif, created_at, updated_at, divisi_id) FROM stdin;
3	ilham2	ilham2	nonaktif@plnbatam.com	$2b$10$A6FXOfwT5y9CAn.nCZJmce2V9rIX5cyLonI5wDX6s7BE8N9XbRzQi	user	t	2026-09-10 07:22:15.114	2026-10-05 12:16:42.479	7
1	Administrator SIMARS	admin	admin@plnbatam.com	$2b$10$1SG0QLCvn427EXr1WR60fuvmOcl8zDmyg.5tF7E54Tua1PFxzBvPa	admin	t	2026-09-10 07:22:14.985	2026-10-16 02:38:01.595	7
2	Ilham	ilham123	user@plnbatam.com	$2b$10$Zr5ZfRrJBjL3AUnhBjJN5OecFC/WGr0sBLhkU6jkn03aScGkiwApy	user	t	2026-09-10 07:22:15.053	2026-10-01 06:57:50.447	3
\.


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 220
-- Name: arsip_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arsip_id_seq', 12, true);


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 237
-- Name: detail_penyerahan_arsip_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detail_penyerahan_arsip_id_seq', 95, true);


--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 230
-- Name: divisi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.divisi_id_seq', 7, true);


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 233
-- Name: jadwal_retensi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jadwal_retensi_id_seq', 57, true);


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 224
-- Name: jenis_arsip_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jenis_arsip_id_seq', 9, true);


--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 222
-- Name: kode_klasifikasi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kode_klasifikasi_id_seq', 516, true);


--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 226
-- Name: lokasi_penyimpanan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lokasi_penyimpanan_id_seq', 11, true);


--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 235
-- Name: penyerahan_arsip_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.penyerahan_arsip_id_seq', 45, true);


--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 228
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 40, true);


--
-- TOC entry 4952 (class 2606 OID 16498)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 16520)
-- Name: arsip arsip_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip
    ADD CONSTRAINT arsip_pkey PRIMARY KEY (id);


--
-- TOC entry 4986 (class 2606 OID 28172)
-- Name: detail_penyerahan_arsip detail_penyerahan_arsip_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_penyerahan_arsip
    ADD CONSTRAINT detail_penyerahan_arsip_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 17075)
-- Name: divisi divisi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisi
    ADD CONSTRAINT divisi_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 17449)
-- Name: jadwal_retensi jadwal_retensi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_retensi
    ADD CONSTRAINT jadwal_retensi_pkey PRIMARY KEY (id);


--
-- TOC entry 4959 (class 2606 OID 16551)
-- Name: jenis_arsip jenis_arsip_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jenis_arsip
    ADD CONSTRAINT jenis_arsip_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 16537)
-- Name: kode_klasifikasi kode_klasifikasi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kode_klasifikasi
    ADD CONSTRAINT kode_klasifikasi_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 16569)
-- Name: lokasi_penyimpanan lokasi_penyimpanan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lokasi_penyimpanan
    ADD CONSTRAINT lokasi_penyimpanan_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 17103)
-- Name: pengaturan_sistem pengaturan_sistem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pengaturan_sistem
    ADD CONSTRAINT pengaturan_sistem_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 28152)
-- Name: penyerahan_arsip penyerahan_arsip_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penyerahan_arsip
    ADD CONSTRAINT penyerahan_arsip_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 16589)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4982 (class 1259 OID 28179)
-- Name: detail_penyerahan_arsip_arsip_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX detail_penyerahan_arsip_arsip_id_idx ON public.detail_penyerahan_arsip USING btree (arsip_id);


--
-- TOC entry 4983 (class 1259 OID 28178)
-- Name: detail_penyerahan_arsip_kode_klasifikasi_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX detail_penyerahan_arsip_kode_klasifikasi_id_idx ON public.detail_penyerahan_arsip USING btree (kode_klasifikasi_id);


--
-- TOC entry 4984 (class 1259 OID 28177)
-- Name: detail_penyerahan_arsip_penyerahan_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX detail_penyerahan_arsip_penyerahan_id_idx ON public.detail_penyerahan_arsip USING btree (penyerahan_id);


--
-- TOC entry 4969 (class 1259 OID 17076)
-- Name: divisi_kode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX divisi_kode_key ON public.divisi USING btree (kode);


--
-- TOC entry 4964 (class 1259 OID 27509)
-- Name: idx_user_divisi_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_divisi_id ON public."user" USING btree (divisi_id);


--
-- TOC entry 4974 (class 1259 OID 17450)
-- Name: jadwal_retensi_kode_klasifikasi_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX jadwal_retensi_kode_klasifikasi_id_key ON public.jadwal_retensi USING btree (kode_klasifikasi_id);


--
-- TOC entry 4957 (class 1259 OID 16590)
-- Name: jenis_arsip_nama_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX jenis_arsip_nama_key ON public.jenis_arsip USING btree (nama);


--
-- TOC entry 4960 (class 1259 OID 16828)
-- Name: jenis_arsip_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX jenis_arsip_slug_key ON public.jenis_arsip USING btree (slug);


--
-- TOC entry 4961 (class 1259 OID 17082)
-- Name: lokasi_penyimpanan_kode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX lokasi_penyimpanan_kode_key ON public.lokasi_penyimpanan USING btree (kode);


--
-- TOC entry 4977 (class 1259 OID 28175)
-- Name: penyerahan_arsip_divisi_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX penyerahan_arsip_divisi_id_idx ON public.penyerahan_arsip USING btree (divisi_id);


--
-- TOC entry 4980 (class 1259 OID 28176)
-- Name: penyerahan_arsip_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX penyerahan_arsip_status_idx ON public.penyerahan_arsip USING btree (status);


--
-- TOC entry 4981 (class 1259 OID 28174)
-- Name: penyerahan_arsip_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX penyerahan_arsip_user_id_idx ON public.penyerahan_arsip USING btree (user_id);


--
-- TOC entry 4965 (class 1259 OID 16592)
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- TOC entry 4968 (class 1259 OID 16591)
-- Name: user_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_username_key ON public."user" USING btree (username);


--
-- TOC entry 4987 (class 2606 OID 16603)
-- Name: arsip arsip_jenis_arsip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip
    ADD CONSTRAINT arsip_jenis_arsip_id_fkey FOREIGN KEY (jenis_arsip_id) REFERENCES public.jenis_arsip(id);


--
-- TOC entry 4998 (class 2606 OID 28220)
-- Name: detail_penyerahan_arsip detail_penyerahan_arsip_arsip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_penyerahan_arsip
    ADD CONSTRAINT detail_penyerahan_arsip_arsip_id_fkey FOREIGN KEY (arsip_id) REFERENCES public.arsip(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4999 (class 2606 OID 28210)
-- Name: detail_penyerahan_arsip detail_penyerahan_arsip_jenis_arsip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_penyerahan_arsip
    ADD CONSTRAINT detail_penyerahan_arsip_jenis_arsip_id_fkey FOREIGN KEY (jenis_arsip_id) REFERENCES public.jenis_arsip(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5000 (class 2606 OID 28205)
-- Name: detail_penyerahan_arsip detail_penyerahan_arsip_kode_klasifikasi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_penyerahan_arsip
    ADD CONSTRAINT detail_penyerahan_arsip_kode_klasifikasi_id_fkey FOREIGN KEY (kode_klasifikasi_id) REFERENCES public.kode_klasifikasi(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5001 (class 2606 OID 28215)
-- Name: detail_penyerahan_arsip detail_penyerahan_arsip_lokasi_penyimpanan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_penyerahan_arsip
    ADD CONSTRAINT detail_penyerahan_arsip_lokasi_penyimpanan_id_fkey FOREIGN KEY (lokasi_penyimpanan_id) REFERENCES public.lokasi_penyimpanan(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5002 (class 2606 OID 28200)
-- Name: detail_penyerahan_arsip detail_penyerahan_arsip_penyerahan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detail_penyerahan_arsip
    ADD CONSTRAINT detail_penyerahan_arsip_penyerahan_id_fkey FOREIGN KEY (penyerahan_id) REFERENCES public.penyerahan_arsip(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4988 (class 2606 OID 17077)
-- Name: arsip fk_arsip_divisi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip
    ADD CONSTRAINT fk_arsip_divisi FOREIGN KEY (divisi_id) REFERENCES public.divisi(id);


--
-- TOC entry 4989 (class 2606 OID 16593)
-- Name: arsip fk_arsip_kode_klasifikasi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip
    ADD CONSTRAINT fk_arsip_kode_klasifikasi FOREIGN KEY (kode_klasifikasi_id) REFERENCES public.kode_klasifikasi(id);


--
-- TOC entry 4990 (class 2606 OID 16598)
-- Name: arsip fk_arsip_lokasi_penyimpanan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip
    ADD CONSTRAINT fk_arsip_lokasi_penyimpanan FOREIGN KEY (lokasi_penyimpanan_id) REFERENCES public.lokasi_penyimpanan(id);


--
-- TOC entry 4992 (class 2606 OID 27510)
-- Name: user fk_user_divisi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT fk_user_divisi FOREIGN KEY (divisi_id) REFERENCES public.divisi(id) ON DELETE SET NULL;


--
-- TOC entry 4993 (class 2606 OID 17451)
-- Name: jadwal_retensi jadwal_retensi_kode_klasifikasi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_retensi
    ADD CONSTRAINT jadwal_retensi_kode_klasifikasi_id_fkey FOREIGN KEY (kode_klasifikasi_id) REFERENCES public.kode_klasifikasi(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4991 (class 2606 OID 17456)
-- Name: lokasi_penyimpanan lokasi_penyimpanan_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lokasi_penyimpanan
    ADD CONSTRAINT lokasi_penyimpanan_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.lokasi_penyimpanan(id);


--
-- TOC entry 4994 (class 2606 OID 28185)
-- Name: penyerahan_arsip penyerahan_arsip_divisi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penyerahan_arsip
    ADD CONSTRAINT penyerahan_arsip_divisi_id_fkey FOREIGN KEY (divisi_id) REFERENCES public.divisi(id) ON DELETE RESTRICT;


--
-- TOC entry 4995 (class 2606 OID 28195)
-- Name: penyerahan_arsip penyerahan_arsip_pihak_kedua_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penyerahan_arsip
    ADD CONSTRAINT penyerahan_arsip_pihak_kedua_id_fkey FOREIGN KEY (pihak_kedua_id) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 4996 (class 2606 OID 28190)
-- Name: penyerahan_arsip penyerahan_arsip_pihak_pertama_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penyerahan_arsip
    ADD CONSTRAINT penyerahan_arsip_pihak_pertama_id_fkey FOREIGN KEY (pihak_pertama_id) REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- TOC entry 4997 (class 2606 OID 28180)
-- Name: penyerahan_arsip penyerahan_arsip_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penyerahan_arsip
    ADD CONSTRAINT penyerahan_arsip_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE RESTRICT;


--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-10-21 13:58:51

--
-- PostgreSQL database dump complete
--

\unrestrict vtl8fHy6EIz1yAvSTWybswls9JXXWet8h4SVTfepkVWsLWydXRNzofRUzHkzfYC

