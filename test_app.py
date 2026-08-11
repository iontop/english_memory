import unittest
import json
import os
import app

class EnglishMemoryTestCase(unittest.TestCase):
    def setUp(self):
        app.app.config['TESTING'] = True
        self.client = app.app.test_client()
        app.init_db()

    def test_get_sets(self):
        response = self.client.get('/api/sets')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 10)
        self.assertGreater(data[0]['id'], data[-1]['id'])

    def test_create_and_delete_set(self):
        # Create set
        payload = {"title": "테스트 단어장", "description": "유닛테스트용 설명"}
        res = self.client.post('/api/sets', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        set_id = data['id']
        self.assertEqual(data['title'], "테스트 단어장")

        # Delete set
        res_del = self.client.delete(f'/api/sets/{set_id}')
        self.assertEqual(res_del.status_code, 200)

    def test_custom_set_persistence_on_init_db(self):
        payload = {"title": "영구 저장 테스트 단어장", "description": "초기화 후 보존 테스트"}
        res = self.client.post('/api/sets', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(res.status_code, 201)
        created_id = json.loads(res.data)['id']

        # Re-trigger init_db to simulate server restart / page refresh
        app.init_db()

        res_sets = self.client.get('/api/sets')
        sets = json.loads(res_sets.data)
        set_ids = [s['id'] for s in sets]
        self.assertIn(created_id, set_ids)

    def test_get_words_in_set(self):
        # Fetch sets to get valid set_id
        res_sets = self.client.get('/api/sets')
        sets = json.loads(res_sets.data)
        preset_set = next(s for s in sets if s.get('word_count', 0) >= 30)
        target_set_id = preset_set['id']

        res = self.client.get(f'/api/sets/{target_set_id}/words')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('words', data)
        self.assertGreaterEqual(len(data['words']), 30)

    def test_auto_add_word_and_remove(self):
        res_sets = self.client.get('/api/sets')
        sets = json.loads(res_sets.data)
        first_set_id = sets[0]['id']

        payload = {
            "set_id": first_set_id,
            "word": "gorgeous",
            "meaning": "아주 멋진, 화려한",
            "phonetic": "[ˈɡɔːrdʒəs]",
            "example_en": "She wore a gorgeous dress.",
            "example_kr": "그녀는 화려한 드레스를 입었다."
        }
        res = self.client.post('/api/words/auto-add', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        word_id = data['word']['id']

        # Verify word appears in set
        res_list = self.client.get(f'/api/sets/{first_set_id}/words')
        words_in_set = json.loads(res_list.data)['words']
        word_ids = [w['id'] for w in words_in_set]
        self.assertIn(word_id, word_ids)

        # Remove word from set
        res_rem = self.client.delete(f'/api/sets/{first_set_id}/words/{word_id}')
        self.assertEqual(res_rem.status_code, 200)

    def test_fetch_naver_dictionary(self):
        dict_data = app.fetch_naver_dictionary("serendipity")
        self.assertEqual(dict_data['word'], "serendipity")
        self.assertTrue(len(dict_data['meaning']) > 0)
        self.assertNotIn("(뜻 정보를 입력해주세요)", dict_data['meaning'])
        self.assertTrue(len(dict_data['phonetic']) > 0)
        self.assertTrue(dict_data['audio_url'].startswith("http"))
        self.assertTrue(len(dict_data['example_en']) > 0)

    def test_auto_add_word_auto_scraping(self):
        res_sets = self.client.get('/api/sets')
        sets = json.loads(res_sets.data)
        first_set_id = sets[0]['id']

        # Auto-add word without providing meaning (relying on Naver auto scraping)
        payload = {
            "set_id": first_set_id,
            "word": "ubiquitous"
        }
        res = self.client.post('/api/words/auto-add', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        word_info = data['word']

        self.assertEqual(word_info['word'], "ubiquitous")
        self.assertTrue(len(word_info['meaning']) > 0)
        self.assertNotIn("(뜻 정보를 입력해주세요)", word_info['meaning'])
        self.assertTrue(len(word_info['phonetic']) > 0)
        self.assertTrue(word_info['audio_url'].startswith("http"))

if __name__ == '__main__':
    unittest.main()

