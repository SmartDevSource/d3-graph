import { useEffect, useRef } from 'react'
import { select, csv, scaleLinear, extent, 
         axisLeft, axisBottom, line, area } from 'd3'

function App() {
  const svg_ref = useRef(),
        tooltip_ref = useRef()
  const width = 800,
        height = 500
  const paddings = {left: 40, top: 40, right: 40, bottom: 40}

  useEffect(()=>{
    select(svg_ref.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
  }, [])

  const getData = async () => {
    try {
      const data = await csv('/datasets/population.csv')
      data.map(row => {
        console.log(Object.fromEntries(Object.entries(row).map(([k, v]) => {
          return [
            k,
            parseInt(v)
          ]
        })))
      })
      setGraph(data)
    } catch(err){
      console.log(err)
    }
  }

  const setGraph = data => {
    const x = scaleLinear(extent(data, d => d.year), [paddings.left, width - paddings.right]).nice(),
          y = scaleLinear(extent(data, d => d.population), [height - paddings.bottom, paddings.top]).nice()

    const x_axis = axisBottom(x)
          .tickFormat(y => y.toString()),
          y_axis = axisLeft(y)
            .tickFormat(v => v === 0 ? '0' : v.toString().slice(0, 2) + 'M')

    select(svg_ref.current)
      .append('g')
      .attr('transform', `translate(0, ${y.range()[0]})`)
      .call(x_axis)

    select(svg_ref.current)
      .append('g')
      .attr('transform', `translate(${x.range()[0]}, 0)`)
      .call(y_axis)

    select(svg_ref.current)
      .append('path')
      .attr('class', 'area')
      .attr('d', area()
        .y0(y.range()[0])
        .y1(d => y(d.population))
        .x(d => x(d.year))(data)
      )

    select(svg_ref.current)
      .append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line()
        .x(d => x(d.year))
        .y(d => y(d.population))
      )

    const tooltip = select(tooltip_ref.current)

    select(svg_ref.current)
      .selectAll()
      .data(data)
      .join('circle')
      .attr('class', 'circle')
      .attr('r', 3)
      .attr('fill', 'blue')
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.population))
      .on('mouseenter', (e, d) => {
        tooltip.style('visibility', 'visible')
          .text(`${d.year}`)
      })
      .on('mousemove', e => {
        tooltip.style('top', (e.pageY - 30) + 'px')
          .style('left', (e.pageX - 5) + 'px')
      })
      .on('mouseleave', () => {
        tooltip.style('visibility', 'hidden')
      })
  }

  useEffect(()=>{
    getData()
  }, [])

  return (
    <>
      <div className='flex-col align-center'>
        <h1>Graph</h1>
        <div ref={tooltip_ref} 
          className='tooltip'
          style={{
            position: 'absolute',
            visibility: 'hidden'
          }}
          >
        </div>
        <svg className='svg-graph' ref={svg_ref}></svg>
      </div>
    </>
  )
}

export default App
