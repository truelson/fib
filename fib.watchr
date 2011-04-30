def run_specs
  system('clear')
  system("node specs.js --verbose")
  system("./install")
end

watch('^(spec/(.*)\.js)') { |m| run_specs }
watch('^(spec_helpers/(.*)\.js)') { |m| run_specs }
watch('^(lib/(.*)\.js)') { |m| run_specs }
watch('^(fib.jsf)') { |m| run_specs }

run_specs
