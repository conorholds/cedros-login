-- F-28: Add missing updated_at triggers on 3 tables
--
-- credit_holds, custom_roles, and abac_policies have updated_at columns
-- but no auto-update trigger. The function update_updated_at_column()
-- already exists from the initial schema migration.

CREATE TRIGGER update_credit_holds_updated_at
  BEFORE UPDATE ON credit_holds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_roles_updated_at
  BEFORE UPDATE ON custom_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abac_policies_updated_at
  BEFORE UPDATE ON abac_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
