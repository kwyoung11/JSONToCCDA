#!/usr/bin/env ruby
require 'rubygems'
require 'csv'
require 'json'

pwd       = File.dirname(__FILE__)

# take the csv input file
Dir.glob("#{pwd}/input.csv") do |file|
	file_path = "#{pwd}/#{file}"  
  file_basename = File.basename(file, ".csv") 

  # now convert to two data structures: section name => value set and 
  # values => section name

	output = CSV.open(file, :headers => true).map { |x| x.to_h }.to_json
	puts output

#   JSON.pretty_generate(CSV.open('filename.csv', headers: true).map do |row|
#   modifier = {}
#   row.each do |k, v|
#     if k =~ /modifier(.)_(.*)$/
#       (modifier[$1] ||= {})[$2] = v
#     end
#   end
#   { id: row['id'],
#     modifier: modifier.sort_by { |k, v| k }.map {|k, v| v }
#   }
# end)
end