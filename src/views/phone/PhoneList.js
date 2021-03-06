/**
 * Created by Administrator on 2017/1/21.
 */
import React, {
	Component
} from 'react';
import PhonePage from './PhonePage';
import classNames from 'classnames';

class PhoneList extends Component {
  constructor(props){
    super(props);
    this.state = {
      deltaX: 0,
      deltaY: 0,
      inTurnPage: false,
      fastTurnPage: false
    };
    this.inPan = false;
    this.panPage = this.panPage.bind(this);
  }

  componentDidMount(){
    const activePage = this.props.scenedata.pages[this.props.currentPageIndex];
    this.HammerManager = new Hammer.Manager(this.refs.list);
    this.HammerManager.on('panstart', this.panPage);
    this.HammerManager.on('panend', this.panPage);
    this.HammerManager.on('panup', this.panPage);
    this.HammerManager.on('pandown', this.panPage);
    this.HammerManager.on('panleft', this.panPage);
    this.HammerManager.on('panright', this.panPage);
    this.Pan = new Hammer.Pan({
        event: 'pan',
        pointers: 0,
        threshold: 15,
        direction: Hammer.DIRECTION_ALL
      });
    if(!activePage.pageOption.longPage){
      this.HammerManager.add(this.Pan);
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.currentPageIndex != this.props.currentPageIndex){
      setTimeout(() => {
        this.HammerManager.add(this.Pan);
      });
    }
  }

  panPage(event){
    const activePage = this.props.scenedata.pages[this.props.currentPageIndex];
    const {type, deltaX, deltaY, additionalEvent} = event;
    this.inPan = true;
    switch (type) {
      case 'panstart':
        break;
      case 'panend':
        this.HammerManager.remove(this.Pan);
        if(activePage.pageOption.turnPageMode === 1){
          // 第一页继续往下滑
          let firstPageDown = this.props.currentPageIndex === 0 && (additionalEvent === 'pandown' || deltaY > 0);
          // 最后一页往上滑
          let lastPageUp = this.props.currentPageIndex === this.props.scenedata.pages.length - 1
           && (additionalEvent === 'panup' || deltaY < 0);
          // 距离太小
          let tooNear = Math.abs(deltaY) <= 40;

          if(firstPageDown || lastPageUp || tooNear){
            this.setState({ deltaY: 0, fastTurnPage: true });
            setTimeout(() => {
              this.inPan = false;
              this.setState({ fastTurnPage: false });
              this.HammerManager.add(this.Pan);
            }, 200);
            return;
          }

          // 往下滑翻页
          if(additionalEvent === 'panup' || deltaY < 0){
            this.setState({ deltaY: -this.props.viewHeight, inTurnPage: true });
            setTimeout(() => {
              this.inPan = false;
              this.props.goNextPage();
              this.setState({ deltaY: 0, inTurnPage: false });
            }, 500);
            return;
          }
          // 往上滑翻页
          if(additionalEvent === 'pandown' || deltaY > 0){
            this.setState({ deltaY: this.props.viewHeight, inTurnPage: true });
            setTimeout(() => {
              this.inPan = false;
              this.props.goPrePage();
              this.setState({ deltaY: 0, inTurnPage: false });
            }, 500);
            return;
          }

        }else{
          // 第一页继续往右滑
          let firstPageRight = this.props.currentPageIndex === 0 && (additionalEvent === 'panright' || deltaX > 0);
          // 最后一页往左滑
          let lastPageLeft = this.props.currentPageIndex === this.props.scenedata.pages.length - 1
           && (additionalEvent === 'panleft' || deltaX < 0);
          // 距离太小
          let tooNear = Math.abs(deltaX) <= 40;

          if(firstPageRight || lastPageLeft || tooNear){
            this.HammerManager.remove(this.Pan);
            this.setState({ deltaX: 0, fastTurnPage: true });
            setTimeout(() => {
              this.inPan = false;
              this.setState({ fastTurnPage: false });
              this.HammerManager.add(this.Pan);
            }, 200);
            return;
          }
          
          // 往左滑翻页
          if(additionalEvent === 'panleft' || deltaX < 0){
            this.HammerManager.remove(this.Pan);
            this.setState({ deltaX: -this.props.viewWidth, inTurnPage: true });
            setTimeout(() => {
              this.inPan = false;
              this.props.goNextPage();
              this.setState({ deltaX: 0, inTurnPage: false });
            }, 500);
            return;
          }
          // 往右滑翻页
          if(additionalEvent === 'panright' || deltaX > 0){
            this.HammerManager.remove(this.Pan);
            this.setState({ deltaX: this.props.viewWidth, inTurnPage: true });
            setTimeout(() => {
              this.inPan = false;
              this.props.goNextPage(); 
              this.setState({ deltaX: 0, inTurnPage: false });
            }, 500);
            return;
          }
        }
        break;
      case 'panleft':
        if(activePage.pageOption.turnPageMode === 2){
          this.setState({ deltaX });
        }
        break;
      case 'panright':
        if(activePage.pageOption.turnPageMode === 2){
          this.setState({ deltaX });
        }
        break;
      case 'panup':
        if(activePage.pageOption.turnPageMode === 1){
          this.setState({ deltaY });
        }
        break;
      case 'pandown':
        if(activePage.pageOption.turnPageMode === 1){
          this.setState({ deltaY });
        }
        break;
      default:
        break;
    }
  }

	render() {
    const prePage = this.props.currentPageIndex === 0 ? {id: 'min', pageOption: {pageSize: 486, turnPageMode: 1}, elements: []}
     : this.props.scenedata.pages[this.props.currentPageIndex - 1];
    const activePage = this.props.scenedata.pages[this.props.currentPageIndex];
    const nextPage = this.props.currentPageIndex === this.props.scenedata.pages.length - 1 ?
     {id: 'max', pageOption: {pageSize: 486, turnPageMode: 1}, elements: []}
      : this.props.scenedata.pages[this.props.currentPageIndex + 1];
    
    const prePageStyle = {
      transform: activePage.pageOption.turnPageMode === 1 ? `translateY(-${this.props.viewHeight - this.state.deltaY}px)`
       : `translateX(-${this.props.viewWidth - this.state.deltaX}px)`,
      display: this.inPan ? '' : 'none'
    };
    const activePageStyle = {
      transform: activePage.pageOption.turnPageMode === 1 ? `translateY(${this.state.deltaY}px)`
       : `translateX(${this.state.deltaX}px)`
    };
    const nextPageStyle = {
      transform: activePage.pageOption.turnPageMode === 1 ? `translateY(${this.props.viewHeight + this.state.deltaY}px)`
       : `translateX(${this.props.viewWidth + this.state.deltaX}px)`,
      display: this.inPan ? '' : 'none'
    };

    const animated = classNames({
      'phone-page': true,
      'animated-page': this.state.inTurnPage,
      'animated-page-fast': this.state.fastTurnPage
    });

    const pageArray = this.props.scenedata.pages;
    /*<ul style={{width: '100%', height: '100%'}}>
        <li className={animated} style={prePageStyle}>
          <PhonePage key={prePage.id} data={prePage} />
        </li>
        <li ref="list" className={animated} style={activePageStyle}>
          <PhonePage key={activePage.id} data={activePage} panPage={this.panPage}/>
        </li>
        <li className={animated} style={nextPageStyle}>
          <PhonePage key={nextPage.id} data={nextPage} />
        </li>
      </ul>*/

		return (
      <ul ref="list" style={{width: '100%', height: '100%'}}>
        {
          pageArray.map((page, index) => {
            switch (index) {
              case this.props.currentPageIndex - 1:
                  return <li key={page.id}  className={animated} style={prePageStyle}>
                          <PhonePage data={page} panPage={this.panPage} active={false} />
                        </li>;
                break;
              case this.props.currentPageIndex:
                return <li key={page.id} className={animated} style={activePageStyle}>
                          <PhonePage data={page} panPage={this.panPage} active={true} />
                        </li>;
                break;
              case this.props.currentPageIndex + 1:
                return <li key={page.id} className={animated} style={nextPageStyle}>
                          <PhonePage data={page} panPage={this.panPage} active={false} />
                        </li>;
                break;
              default:
                return <li key={page.id} className={animated} style={{display: 'none'}}>
                          <PhonePage data={page} panPage={this.panPage} active={false} />
                        </li>;
                break;
            }
          })
        }
      </ul>
		);
	}
}

export default PhoneList;