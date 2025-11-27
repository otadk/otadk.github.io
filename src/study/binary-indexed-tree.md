
# 树状数组 bit

- 学习资料 https://leetcode.cn/problems/range-sum-query-mutable/solutions/2524481/dai-ni-fa-ming-shu-zhuang-shu-zu-fu-shu-lyfll/

## 理论学习

### 使用范围

正常来说需要求数组的子数组和直接用前缀和即可o(1)完成，然而这只适用于数组不变的情况，一旦数组内容变化，每次变化都要o(n)去更新前缀和。树状数组可以实现更新和求和都o(lgn)。

没那么重要的补充：

1. 如果数组经常变化，只需要求一次和，那么原本的数组结构就可以更新o(1)，求和o(n)，树状数组其实就是数组与前缀和的一种平衡使得效率最佳(前缀和对比原本结构正好相反更新o(n)，求和o(1))，当然这是针对更新以及求和都有且都很多的情况，因此我们甚至可以根据不同的数组情况与不同的更新求和操作的比例来找到最佳平衡点优化性能(一般情况下直接2分即可获得极大的性能提升)。

2. 树状数组初始化需要o(n)复杂度，更新以及求和都是o(lgn)，常见的题目一般会出类似o(nlgn)这样的复杂度，如果用o(n^2)前缀和就会超时，可以根据这个特征来选择使用这个算法解决问题。

### 平衡拆分逻辑

本质上就是先把数组拆分成[1,1],[1,2],[1,4],[1,8],...,[1,2^n]这样下标的区间，然后在这些区间之间减去左区间之后再拆，比如[5,8]就当成[1,3]来拆然后再加上4就是[1,1]+[1,2]+[3,3]。以下是一个示例。（这个拆分不太好理解需要仔细看下，下面给出了输出）
```
[1,1]=[1,1]
[1,2]=[1,2]
[1,3]=[1,2]+[3,3]
[1,4]=[1,4]
[1,5]=[1,4]+[5,5]
[1,6]=[1,4]+[5,6]
[1,7]=[1,4]+[5,6]+[7,7]
[1,8]=[1,8]

(1=1)
(2=2)
(3=2+1)
(4=4)
(5=4+1)
(6=4+2)
(7=4+2+1)
(8=8)
```

所以我们会发现n长度的数组能拆分出n个区间，以下是一个js的拆分示例，就是一个遍历加计算l和r。实际上只需要记一下l的计算是(r - (r & -r) + 1)。

```javascript
/**
 * bitSplit(n)
 * 返回长度为 n 的二维数组，索引从 0..n-1，对应 k = 1..n。
 * 每一项都是一个区间 [l, r]，表示在处理前缀 [1, k] 时
 * 最右侧添加的那段长度为 2 的幂的区间（即 lowBit(k) 对应的区间）。
 *
 * 例：bitSplit(8) => [
 *   [1,1], [1,2], [3,3], [1,4],
 *   [5,5], [5,6], [7,7], [1,8]
 * ]
 * 
 * 0101
 * 1011
 */
const bitSplit = (n) => {
  const res = [];
  if (!n ||  n <= 0) return res;
  // 区间为 [r - lowBit + 1, r]
  for (let r = 1; r <= n; r++) {
    const lowBit = r & -r; // 取最低位（2 的幂）
    const l = r - lowBit + 1;
    const r = r;
    res.push([l, r]);
  }
  return res;
};

console.log(bitSplit(8)); // 输出：[[1,1],[1,2],[3,3],[1,4],[5,5],[5,6],[7,7],[1,8]]
```

### 简化处理，构造结构

由于一定是n个区间并且是基于右端因此可以简化为tree数组，tree[i]表示[(i - (i & -i) + 1), i]这个区间的和。我们可以简单的双重遍历计算出tree的数据，但是这样太慢了实际上可以一轮处理好，因为树状数组的特性导致每次计算前面的数据都可以减少所有后面数据的计算次数，刷表法的思路。只需要注意找下一个2倍数的计算是通过(i + (i & -i))。

```javascript
const initTree = (arr) => {
  const n = arr.length;
  const tree = new Array(n + 1).fill(0);
  if (!n ||  n <= 0) return res;
  for (let i = 1; i <= n; ++i) {
    tree[i] += arr[i - 1];
    const next = i + (i & -i);
    if (next <= n) {
      tree[next] += tree[i];
    }
  }
  return tree;
}

console.log(initTree([1,2,3,4,5])); // 输出：[0,1,3,3,10,5]
```

### 更新与求和

继续以上方1到8的例子来看更新每个元素时哪些tree需要更新。至于求和可以通过前面平衡拆分的那个res来理解，要算[l,r]区间的值其实就是算sum(1,r)-sum(1,l-1)，而sum(1,r)我们可以通过计算用tree来表示，不过前面平衡拆分只介绍了怎么拆，求和逻辑要怎么算呢？仔细观察可以发现计算[1,i]是一个迭代过程，每一步往前缩一个2倍直到变成[1,2^k]，每缩一次都要加上[i - (i & -i) + 1, i]然后把i重新用i - i & -i赋值。

```
更新：
1 -> [1, 2, 4, 8]
2 -> [2, 4, 8]
3 -> [3, 4, 8]
4 -> [4, 8]
5 -> [5, 6, 8]
6 -> [6, 8]
7 -> [7, 8]
8 -> [8]
求和：
[1,1]=[1,1]
[1,2]=[1,2]
[1,3]=[3,3]+[1,2]
[1,4]=[1,4]
[1,5]=[5,5]+[1,4]
[1,6]=[5,6]+[1,4]
[1,7]=[7,7]+[5,6]+[1,4]
[1,8]=[1,8]
```

更新的逻辑其实跟初始化的逻辑很像也是不断往后找下一个2倍数也是通过(i + (i & -i))，而求和则是不断让2倍切分右端点直到全部。

```javascript
const initTree = (arr) => {
  const n = arr.length;
  const tree = new Array(n + 1).fill(0);
  if (!n ||  n <= 0) return res;
  for (let i = 1; i <= n; ++i) {
    tree[i] += arr[i - 1];
    const next = i + (i & -i);
    if (next <= n) {
      tree[next] += tree[i];
    }
  }
  return tree;
}

const arr = [1,2,3,4,5,6,7,8];
const tree = initTree(arr);

const update = (index, value) => {
  const n = arr.length;
  for (let i = index + 1; i <= n; i += i & -i) {
    tree[i] += value - arr[index]
  }
  arr[index] = value;
}

update(3, 9);
console.log({arr, tree}); // tree: [0, 1, 3, 3, 10, 5, 11, 7, 36]

const getSum = (right) => {
  const n = tree.length - 1;
  let sum = 0;
  for (let i = right; i > 0; i -= (i & -i)) {
    sum += tree[i];
  }
  return sum;
}

console.log(getSum(2)); // 3

const getDiff = (left, right) => {
  return getSum(right + 1) - getSum(left);
}

console.log(getDiff(1, 2)); // 5
```

