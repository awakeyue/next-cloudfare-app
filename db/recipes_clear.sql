-- 清空菜谱标签关联表
DELETE FROM recipe_tags;

-- 清空标签表
DELETE FROM tags;

-- 清空菜谱表
DELETE FROM recipes;

-- 重置自增ID
DELETE FROM sqlite_sequence WHERE name IN ('recipes', 'tags');