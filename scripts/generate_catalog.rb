#!/usr/bin/env ruby

require "json"
require "pathname"

ROOT = Pathname.new(__dir__).join("..").expand_path
CATALOG = ROOT.join("list.json")
ACTIVITY_GLOB = ROOT.join("activities", "**", "index.html").to_s
REQUIRED_FIELDS = %w[schemaVersion id order class subject topic title description activityType status].freeze
CLASS_SLUGS = { "III" => "3", "VI" => "6", "VII" => "7", "VIII" => "8", "IX" => "9", "X" => "10" }.freeze
VALID_STATUSES = %w[active planned].freeze

def slug(value)
  value.to_s.unicode_normalize(:nfkd).encode("ASCII", invalid: :replace, undef: :replace, replace: "")
       .downcase.gsub(/[^a-z0-9]+/, "-").gsub(/\A-+|-+\z/, "")
end

def load_metadata(path)
  content = path.read(encoding: "UTF-8")
  matches = content.scan(%r{<script\s+type=["']application/json["']\s+id=["']activity-metadata["']\s*>(.*?)</script>}mi)
  raise "#{path.relative_path_from(ROOT)}: expected exactly one activity-metadata block" unless matches.length == 1
  [JSON.parse(matches.first.first), content]
rescue JSON::ParserError => error
  raise "#{path.relative_path_from(ROOT)}: invalid metadata JSON: #{error.message}"
end

def validate_path(path, metadata)
  relative = path.relative_path_from(ROOT).each_filename.to_a
  unless [6, 7].include?(relative.length) && relative.first == "activities" && relative.last == "index.html"
    raise "#{path.relative_path_from(ROOT)}: expected activities/class/subject/topic/[subtopic/]activity/index.html"
  end

  class_slug, subject_slug, topic_slug = relative[1, 3]
  expected_class = CLASS_SLUGS.fetch(metadata["class"].to_s) { slug(metadata["class"]) }
  raise "#{path.relative_path_from(ROOT)}: class path must be #{expected_class}" unless class_slug == expected_class
  raise "#{path.relative_path_from(ROOT)}: subject path conflicts with metadata" unless subject_slug == slug(metadata["subject"])
  raise "#{path.relative_path_from(ROOT)}: topic path conflicts with metadata" unless topic_slug == slug(metadata["topic"])

  subtopic = metadata["subtopic"].to_s.strip
  if relative.length == 7
    raise "#{path.relative_path_from(ROOT)}: missing subtopic metadata" if subtopic.empty?
    raise "#{path.relative_path_from(ROOT)}: subtopic path conflicts with metadata" unless relative[4] == slug(subtopic)
  elsif !subtopic.empty?
    raise "#{path.relative_path_from(ROOT)}: subtopic metadata requires a subtopic directory"
  end

  activity_slug = relative[-2]
  raise "#{path.relative_path_from(ROOT)}: activity directory must use a lowercase kebab-case slug" unless activity_slug == slug(activity_slug)
end

def build_activity(path)
  metadata, content = load_metadata(path)
  missing = REQUIRED_FIELDS.reject { |field| metadata.key?(field) && !metadata[field].to_s.strip.empty? }
  raise "#{path.relative_path_from(ROOT)}: missing #{missing.join(', ')}" unless missing.empty?
  raise "#{path.relative_path_from(ROOT)}: schemaVersion must be 1" unless metadata["schemaVersion"] == 1
  raise "#{path.relative_path_from(ROOT)}: invalid status #{metadata['status'].inspect}" unless VALID_STATUSES.include?(metadata["status"])
  validate_path(path, metadata)

  if content.match?(%r{^\s*<script\b[^>]+src=["'][^"']+["']}i)
    raise "#{path.relative_path_from(ROOT)}: JavaScript must be embedded in the HTML"
  end
  if content.match?(%r{^\s*<link\b[^>]+rel=["']stylesheet["']}i) || content.match?(%r{^\s*<link\b[^>]+href=["'][^"']+["'][^>]+rel=["']stylesheet["']}i)
    raise "#{path.relative_path_from(ROOT)}: CSS must be embedded in the HTML"
  end

  order = Integer(metadata["order"])
  activity = {
    "id" => metadata["id"], "class" => metadata["class"].to_s,
    "subject" => metadata["subject"].to_s, "topic" => metadata["topic"].to_s,
    "activity_name" => metadata["title"].to_s, "activity_details" => metadata["description"].to_s,
    "activity_type" => metadata["activityType"].to_s, "status" => metadata["status"].to_s
  }
  activity["subtopic"] = metadata["subtopic"].to_s unless metadata["subtopic"].to_s.strip.empty?
  activity["activity_path"] = path.relative_path_from(ROOT).to_s if metadata["status"] == "active"
  [order, activity, path]
rescue ArgumentError, TypeError
  raise "#{path.relative_path_from(ROOT)}: order must be an integer"
end

begin
  records = Dir.glob(ACTIVITY_GLOB).sort.map { |file| build_activity(Pathname.new(file)) }
  raise "No activity HTML files found" if records.empty?

  { "order" => records.group_by(&:first), "id" => records.group_by { |record| record[1]["id"] } }.each do |field, groups|
    duplicates = groups.select { |_value, group| group.length > 1 }
    next if duplicates.empty?
    details = duplicates.map { |value, group| "#{value}: #{group.map { |record| record[2].relative_path_from(ROOT) }.join(', ')}" }
    raise "Duplicate #{field} values: #{details.join('; ')}"
  end

  output = JSON.pretty_generate("activities" => records.sort_by(&:first).map { |record| record[1] }) + "\n"
  case ARGV.first
  when "--validate"
    active = records.count { |record| record[1]["status"] == "active" }
    puts "Validated #{records.length} activities (#{active} active, #{records.length - active} planned)."
  when "--check"
    raise "list.json is out of date; run ruby scripts/generate_catalog.rb" unless CATALOG.read(encoding: "UTF-8") == output
    puts "list.json is up to date (#{records.length} activities)."
  when nil
    CATALOG.write(output)
    puts "Generated list.json from #{records.length} activity HTML files."
  else
    raise "Unknown option #{ARGV.first.inspect}; use --validate or --check"
  end
rescue StandardError => error
  warn "Catalog generation failed: #{error.message}"
  exit 1
end
