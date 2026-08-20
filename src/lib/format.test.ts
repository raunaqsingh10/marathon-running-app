import { describe, expect, it } from 'vitest'
import { durationFieldsFromSeconds, durationFieldsFromValue, durationValueFromFields, formatDuration, formatPace, paceSeconds, parseDuration } from './format'

describe('run formatting', () => {
  it('parses minute and hour durations', () => {
    expect(parseDuration('44:32')).toBe(2672)
    expect(parseDuration('1:08:42')).toBe(4122)
  })

  it('rejects malformed durations', () => {
    expect(parseDuration('44:72')).toBeNull()
    expect(parseDuration('')).toBeNull()
    expect(parseDuration('4:2:8:1')).toBeNull()
  })

  it('calculates and displays pace', () => {
    expect(paceSeconds(2672, 8.2)).toBe(326)
    expect(formatPace(326)).toBe('5:26')
    expect(formatDuration(4122)).toBe('1:08:42')
  })

  it('converts segmented duration fields without requiring typed colons', () => {
    expect(durationFieldsFromValue('44:32')).toEqual({ hours: '', minutes: '44', seconds: '32' })
    expect(durationFieldsFromSeconds(4122)).toEqual({ hours: '1', minutes: '08', seconds: '42' })
    expect(durationValueFromFields({ hours: '', minutes: '44', seconds: '32' })).toBe('44:32')
    expect(durationValueFromFields({ hours: '1', minutes: '08', seconds: '42' })).toBe('1:08:42')
    expect(parseDuration(durationValueFromFields({ hours: '1', minutes: '08', seconds: '42' }))).toBe(4122)
    expect(parseDuration(durationValueFromFields({ hours: '', minutes: '60', seconds: '00' }))).toBeNull()
    expect(parseDuration(durationValueFromFields({ hours: '', minutes: '44', seconds: '60' }))).toBeNull()
  })
})
