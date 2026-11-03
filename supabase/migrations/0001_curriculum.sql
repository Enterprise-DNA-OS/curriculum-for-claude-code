-- Trusted-operator curriculum records. Internal decisions never confer accreditation.
CREATE TABLE programmes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE CHECK (btrim(code)<>''),
 title text NOT NULL CHECK (btrim(title)<>''), owner text NOT NULL CHECK (btrim(owner)<>''),
 jurisdiction text NOT NULL CHECK (jurisdiction IN ('NZ','AU','OTHER')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), programme_id uuid NOT NULL REFERENCES programmes(id),
 number integer NOT NULL CHECK (number>0), title text NOT NULL CHECK (btrim(title)<>''),
 level integer NOT NULL CHECK (level BETWEEN 1 AND 10), credits numeric(10,2) NOT NULL CHECK (credits>0),
 state text NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','in-review','approved')),
 review_due date NOT NULL, effective_date date NOT NULL, rationale text NOT NULL CHECK (btrim(rationale)<>''),
 submitted_by text, submitted_at timestamptz, approved_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(programme_id,number)
);
CREATE TABLE modules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version_id uuid NOT NULL REFERENCES versions(id),
 code text NOT NULL CHECK (btrim(code)<>''), title text NOT NULL CHECK (btrim(title)<>''),
 level integer NOT NULL CHECK (level BETWEEN 1 AND 10), credits numeric(10,2) NOT NULL CHECK (credits>0),
 hours numeric(10,2) NOT NULL CHECK (hours>0), aim text NOT NULL CHECK (btrim(aim)<>''),
 content text NOT NULL CHECK (btrim(content)<>''), delivery text NOT NULL CHECK (btrim(delivery)<>''),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(version_id,code), UNIQUE(id,version_id)
);
CREATE TABLE outcomes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version_id uuid NOT NULL REFERENCES versions(id),
 module_id uuid, code text NOT NULL CHECK (btrim(code)<>''), description text NOT NULL CHECK (btrim(description)<>''),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(version_id,code), UNIQUE(id,version_id),
 FOREIGN KEY(module_id,version_id) REFERENCES modules(id,version_id)
);
CREATE INDEX outcomes_module_idx ON outcomes(module_id);
CREATE TABLE assessments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version_id uuid NOT NULL REFERENCES versions(id),
 module_id uuid NOT NULL, code text NOT NULL CHECK (btrim(code)<>''), title text NOT NULL CHECK (btrim(title)<>''),
 method text NOT NULL CHECK (btrim(method)<>''), criteria text NOT NULL CHECK (btrim(criteria)<>''),
 weight numeric(5,2) NOT NULL CHECK (weight>0 AND weight<=100),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(version_id,code), UNIQUE(id,version_id),
 FOREIGN KEY(module_id,version_id) REFERENCES modules(id,version_id)
);
CREATE INDEX assessments_module_idx ON assessments(module_id);
CREATE TABLE alignments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version_id uuid NOT NULL REFERENCES versions(id),
 learning_outcome_id uuid NOT NULL, programme_outcome_id uuid NOT NULL,
 evidence text NOT NULL CHECK (btrim(evidence)<>''),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(learning_outcome_id,version_id) REFERENCES outcomes(id,version_id),
 FOREIGN KEY(programme_outcome_id,version_id) REFERENCES outcomes(id,version_id),
 UNIQUE(learning_outcome_id,programme_outcome_id)
);
CREATE INDEX alignments_version_idx ON alignments(version_id);
CREATE INDEX alignments_programme_idx ON alignments(programme_outcome_id);
CREATE TABLE assessment_outcomes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version_id uuid NOT NULL REFERENCES versions(id),
 assessment_id uuid NOT NULL, outcome_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(assessment_id,version_id) REFERENCES assessments(id,version_id),
 FOREIGN KEY(outcome_id,version_id) REFERENCES outcomes(id,version_id), UNIQUE(assessment_id,outcome_id)
);
CREATE INDEX assessment_outcomes_version_idx ON assessment_outcomes(version_id);
CREATE INDEX assessment_outcomes_outcome_idx ON assessment_outcomes(outcome_id);
CREATE TABLE tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version_id uuid NOT NULL REFERENCES versions(id),
 owner text NOT NULL CHECK (btrim(owner)<>''), note text NOT NULL CHECK (btrim(note)<>''), due date NOT NULL,
 resolution text, closed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((closed_at IS NULL AND resolution IS NULL) OR (closed_at IS NOT NULL AND btrim(resolution)<>''))
);
CREATE INDEX tasks_version_idx ON tasks(version_id);
CREATE INDEX tasks_open_due_idx ON tasks(due) WHERE closed_at IS NULL;
CREATE TABLE reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version_id uuid NOT NULL REFERENCES versions(id),
 actor text NOT NULL CHECK (btrim(actor)<>''), decision text NOT NULL CHECK (decision IN ('submitted','changes','approved')),
 evidence text NOT NULL CHECK (btrim(evidence)<>''), snapshot jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reviews_version_idx ON reviews(version_id);
CREATE TABLE imports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), fingerprint text NOT NULL UNIQUE,
 actor text NOT NULL CHECK (btrim(actor)<>''), original_csv text NOT NULL, mapping jsonb NOT NULL,
 record_count integer NOT NULL CHECK (record_count>0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE import_rows (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), import_id uuid NOT NULL REFERENCES imports(id),
 version_id uuid NOT NULL REFERENCES versions(id), row_number integer NOT NULL, source_row jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(import_id,row_number)
);
CREATE INDEX import_rows_version_idx ON import_rows(version_id);
CREATE TABLE activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor text NOT NULL CHECK (btrim(actor)<>''),
 action text NOT NULL, record_id uuid, detail jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_record_idx ON activity(record_id);
CREATE UNIQUE INDEX programme_code_folded ON programmes(lower(code));
CREATE UNIQUE INDEX module_code_folded ON modules(version_id,lower(code));
CREATE UNIQUE INDEX outcome_code_folded ON outcomes(version_id,lower(code));
CREATE UNIQUE INDEX assessment_code_folded ON assessments(version_id,lower(code));
CREATE FUNCTION touch_updated() RETURNS trigger LANGUAGE plpgsql AS $$
 BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE FUNCTION immutable_record() RETURNS trigger LANGUAGE plpgsql AS $$
 BEGIN RAISE EXCEPTION 'This record is append-only'; END $$;
CREATE FUNCTION draft_child() RETURNS trigger LANGUAGE plpgsql AS $$
 DECLARE v uuid; s text;
 BEGIN
 IF TG_OP='DELETE' THEN v=OLD.version_id; ELSE v=NEW.version_id; END IF;
 IF TG_OP='UPDATE' AND NEW.version_id<>OLD.version_id THEN RAISE EXCEPTION 'Cannot move a record to another version'; END IF;
 SELECT state INTO s FROM versions WHERE id=v FOR UPDATE;
 IF s IS DISTINCT FROM 'draft' THEN RAISE EXCEPTION 'Version is not draft; request changes or revise it'; END IF;
 UPDATE versions SET updated_at=now() WHERE id=v;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
 END $$;
CREATE FUNCTION guard_version() RETURNS trigger LANGUAGE plpgsql AS $$
 BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Versions cannot be deleted'; END IF;
 IF OLD.state='approved' THEN RAISE EXCEPTION 'Approved version is immutable; revise it'; END IF;
 IF NEW.programme_id<>OLD.programme_id OR NEW.number<>OLD.number THEN RAISE EXCEPTION 'Version identity is immutable'; END IF;
 IF OLD.state='in-review' AND (to_jsonb(NEW)-ARRAY['state','approved_at','updated_at']) IS DISTINCT FROM
 (to_jsonb(OLD)-ARRAY['state','approved_at','updated_at']) THEN RAISE EXCEPTION 'Submitted curriculum is frozen'; END IF;
 RETURN NEW; END $$;
CREATE TRIGGER guard_version BEFORE UPDATE OR DELETE ON versions FOR EACH ROW EXECUTE FUNCTION guard_version();
CREATE FUNCTION guard_alignment() RETURNS trigger LANGUAGE plpgsql AS $$
 DECLARE a uuid; b uuid;
 BEGIN
 SELECT module_id INTO a FROM outcomes WHERE id=NEW.learning_outcome_id;
 SELECT module_id INTO b FROM outcomes WHERE id=NEW.programme_outcome_id;
 IF a IS NULL OR b IS NOT NULL THEN RAISE EXCEPTION 'Map a module learning outcome to a programme outcome'; END IF;
 RETURN NEW; END $$;
CREATE TRIGGER alignment_kind BEFORE INSERT OR UPDATE ON alignments FOR EACH ROW EXECUTE FUNCTION guard_alignment();
CREATE FUNCTION guard_assessment_map() RETURNS trigger LANGUAGE plpgsql AS $$
 DECLARE a uuid; b uuid;
 BEGIN
 SELECT module_id INTO a FROM assessments WHERE id=NEW.assessment_id;
 SELECT module_id INTO b FROM outcomes WHERE id=NEW.outcome_id;
 IF a IS DISTINCT FROM b THEN RAISE EXCEPTION 'Assessment must map to an outcome in the same module'; END IF;
 RETURN NEW; END $$;
CREATE TRIGGER assessment_map_kind BEFORE INSERT OR UPDATE ON assessment_outcomes FOR EACH ROW EXECUTE FUNCTION guard_assessment_map();
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['programmes','versions','modules','outcomes','assessments','alignments','assessment_outcomes','tasks','reviews','imports','import_rows','activity'] LOOP
 EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON %I FROM PUBLIC',t);
 EXECUTE format('CREATE TRIGGER touch_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated()',t);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['modules','outcomes','assessments','alignments','assessment_outcomes'] LOOP
 EXECUTE format('CREATE TRIGGER draft_only BEFORE INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION draft_child()',t);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['reviews','imports','import_rows','activity','programmes'] LOOP
 EXECUTE format('CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION immutable_record()',t);
 END LOOP;
 END $$;
CREATE VIEW version_register WITH (security_invoker=true) AS
 SELECT v.id,p.code||'/v'||v.number AS reference,p.code AS programme,p.owner,p.jurisdiction,v.title,v.number,v.level,v.credits,v.state,v.review_due,v.effective_date,v.updated_at,
 (SELECT count(*)::int FROM modules m WHERE m.version_id=v.id) AS modules,
 (SELECT coalesce(sum(m.credits),0) FROM modules m WHERE m.version_id=v.id) AS module_credits,
 (SELECT count(*)::int FROM tasks t WHERE t.version_id=v.id AND t.closed_at IS NULL) AS open_tasks
 FROM versions v JOIN programmes p ON p.id=v.programme_id;
CREATE VIEW mapping_coverage WITH (security_invoker=true) AS
 SELECT o.version_id, v.reference, o.id, o.code, o.description, m.code AS module,
 (SELECT count(*)::int FROM alignments a WHERE a.learning_outcome_id=o.id) AS programme_links,
 (SELECT count(*)::int FROM assessment_outcomes a WHERE a.outcome_id=o.id) AS assessments
 FROM outcomes o JOIN modules m ON m.id=o.module_id JOIN version_register v ON v.id=o.version_id;
CREATE VIEW review_queue WITH (security_invoker=true) AS
 SELECT reference,title,state,owner,review_due,current_date-review_due AS days_overdue,open_tasks
 FROM version_register WHERE state<>'approved' AND (review_due<=current_date+7 OR state='in-review');
CREATE VIEW curriculum_findings WITH (security_invoker=true) AS
 SELECT v.id AS version_id,v.reference,'credit-total'::text AS rule,'Module credits do not equal the programme total'::text AS finding FROM version_register v WHERE v.module_credits<>v.credits
 UNION ALL SELECT v.id,v.reference,'programme-outcomes','No programme outcomes recorded' FROM version_register v WHERE NOT EXISTS(SELECT 1 FROM outcomes o WHERE o.version_id=v.id AND o.module_id IS NULL)
 UNION ALL SELECT o.version_id,v.reference,'uncovered-programme-outcome',o.code||': no module outcome mapped' FROM outcomes o JOIN version_register v ON v.id=o.version_id WHERE o.module_id IS NULL AND NOT EXISTS(SELECT 1 FROM alignments a WHERE a.programme_outcome_id=o.id)
 UNION ALL SELECT m.version_id,v.reference,'module-outcomes',m.code||': no learning outcomes' FROM modules m JOIN version_register v ON v.id=m.version_id WHERE NOT EXISTS(SELECT 1 FROM outcomes o WHERE o.module_id=m.id)
 UNION ALL SELECT c.version_id,c.reference,'unmapped-learning-outcome',c.code||': no programme outcome' FROM mapping_coverage c WHERE programme_links=0
 UNION ALL SELECT c.version_id,c.reference,'unassessed-learning-outcome',c.code||': no assessment mapped' FROM mapping_coverage c WHERE assessments=0
 UNION ALL SELECT m.version_id,v.reference,'assessment-weight',m.code||': assessment weights must total 100 under the demo policy' FROM modules m JOIN version_register v ON v.id=m.version_id WHERE (SELECT coalesce(sum(weight),0) FROM assessments a WHERE a.module_id=m.id)<>100
 UNION ALL SELECT a.version_id,v.reference,'unmapped-assessment',a.code||': no learning outcome mapped' FROM assessments a JOIN version_register v ON v.id=a.version_id WHERE NOT EXISTS(SELECT 1 FROM assessment_outcomes ao WHERE ao.assessment_id=a.id)
 UNION ALL SELECT m.version_id,v.reference,'nz-learning-hours',m.code||': hours differ from ten times credits' FROM modules m JOIN version_register v ON v.id=m.version_id WHERE v.jurisdiction='NZ' AND m.hours<>m.credits*10;
REVOKE ALL ON version_register,mapping_coverage,review_queue,curriculum_findings FROM PUBLIC;
